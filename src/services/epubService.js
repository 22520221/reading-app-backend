
const { pool, poolConnect, sql } = require("../config/database");
const supabase = require("../config/supabase");

const AdmZip = require("adm-zip");
const { XMLParser } = require("fast-xml-parser");
const cheerio = require("cheerio");
const path = require("path");

// Parser XML dùng để đọc cấu trúc EPUB
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
});

// 1. Tải file EPUB từ Supabase Storage
const downloadEpub = async (bookId) => {
    await poolConnect;

    // Lấy thông tin sách từ SQL Server
    const result = await pool.request()
        .input("BookID", sql.Int, bookId)
        .query(`
            SELECT
                BookID,
                Title,
                EpubStoragePath,
                EpubOriginalName
            FROM dbo.Books
            WHERE BookID = @BookID
        `);

    const book = result.recordset[0];

    if (!book) {
        const error = new Error("Khong tim thay sach");
        error.statusCode = 404;
        throw error;
    }

    if (!book.EpubStoragePath) {
        const error = new Error("Sach chua co file EPUB");
        error.statusCode = 404;
        throw error;
    }

    // Tải EPUB từ bucket books
    const { data, error } = await supabase.storage
        .from("books")
        .download(book.EpubStoragePath);

    if (error) {
        console.error("Loi tai EPUB:", error.message);

        const downloadError = new Error(
            "Khong the tai file EPUB tu Supabase"
        );

        downloadError.statusCode = 502;
        throw downloadError;
    }

    // Chuyển Blob thành Buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
        book,
        buffer
    };
};

// 2. Trích xuất danh sách chương và nội dung từ EPUB
const extractChapters = async (bookId) => {
    // Tải EPUB
    const { book, buffer } = await downloadEpub(bookId);

    // Giải nén EPUB
    const zip = new AdmZip(buffer);

    // Đọc container.xml
    const containerEntry = zip.getEntry("META-INF/container.xml");

    if (!containerEntry) {
        throw new Error("EPUB khong co file container.xml");
    }

    const containerXml = containerEntry.getData().toString("utf8");
    const containerData = parser.parse(containerXml);

    const opfPath =
        containerData.container.rootfiles.rootfile["@_full-path"];

    if (!opfPath) {
        throw new Error("Khong tim thay duong dan OPF");
    }

    // Đọc file OPF
    const opfEntry = zip.getEntry(opfPath);

    if (!opfEntry) {
        throw new Error("Khong tim thay file OPF");
    }

    const opfXml = opfEntry.getData().toString("utf8");
    const opfData = parser.parse(opfXml);

    const manifestItems = Array.isArray(opfData.package.manifest.item)
        ? opfData.package.manifest.item
        : [opfData.package.manifest.item];

    // Tìm file NCX
    const ncxItem = manifestItems.find(
        item => item["@_media-type"] === "application/x-dtbncx+xml"
    );

    if (!ncxItem) {
        throw new Error("Khong tim thay file muc luc NCX");
    }

    const opfDirectory = path.posix.dirname(opfPath);

    const ncxPath = path.posix.normalize(
        path.posix.join(opfDirectory, ncxItem["@_href"])
    );

    // Đọc NCX
    const ncxEntry = zip.getEntry(ncxPath);

    if (!ncxEntry) {
        throw new Error("Khong tim thay file NCX");
    }

    const ncxXml = ncxEntry.getData().toString("utf8");
    const ncxData = parser.parse(ncxXml);

    const navMap = ncxData.ncx?.navMap?.navPoint;

    // Đệ quy lấy tất cả chương trong mục lục
    const flattenNavPoints = (points, result = []) => {
        const list = Array.isArray(points)
            ? points
            : points
                ? [points]
                : [];

        for (const point of list) {
            const title = point.navLabel?.text;
            const source = point.content?.["@_src"];

            if (title && source) {
                result.push({
                    title: String(title).trim(),
                    source: String(source).trim()
                });
            }

            if (point.navPoint) {
                flattenNavPoints(point.navPoint, result);
            }
        }

        return result;
    };

    const chapterItems = flattenNavPoints(navMap);

    if (chapterItems.length === 0) {
        throw new Error("EPUB khong co chuong nao trong muc luc");
    }

    // Đọc nội dung HTML của từng chương
    const chapters = [];

    for (let i = 0; i < chapterItems.length; i++) {
        const item = chapterItems[i];

        // Bỏ fragment (#...) và giải mã tên file
        const htmlFile = item.source.split("#")[0];
        const decodedFile = decodeURIComponent(htmlFile);

        const htmlPath = path.posix.normalize(
            path.posix.join(
                path.posix.dirname(ncxPath),
                decodedFile
            )
        );

        const htmlEntry = zip.getEntry(htmlPath);

        if (!htmlEntry) {
            console.warn("Khong tim thay file chuong:", htmlPath);
            continue;
        }

        const html = htmlEntry.getData().toString("utf8");

        // Chuyển HTML thành văn bản thuần
        const $ = cheerio.load(html);

        $("script, style, head").remove();

        const content = $("body")
            .text()
            .replace(/\s+/g, " ")
            .trim();

        chapters.push({
            chapterNumber: i + 1,
            title: item.title,
            content: content,
            contentLength: content.length
        });
    }

    return {
        book: {
            bookId: book.BookID,
            title: book.Title
        },
        totalChapters: chapters.length,
        chapters
    };
};

// 3. Lấy danh sách chương, không trả về nội dung đầy đủ
const getBookChapters = async (bookId) => {
    const result = await extractChapters(bookId);

    return {
        book: result.book,
        totalChapters: result.totalChapters,
        chapters: result.chapters.map(chapter => ({
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            contentLength: chapter.contentLength
        }))
    };
};

// 4. Lấy nội dung một chương cụ thể
const getChapterContent = async (bookId, chapterNumber) => {
    const chapterNo = Number(chapterNumber);

    if (!Number.isInteger(chapterNo) || chapterNo < 1) {
        const error = new Error("So thu tu chuong khong hop le");
        error.statusCode = 400;
        throw error;
    }

    const result = await extractChapters(bookId);

    const chapter = result.chapters.find(
        item => item.chapterNumber === chapterNo
    );

    if (!chapter) {
        const error = new Error("Khong tim thay chuong");
        error.statusCode = 404;
        throw error;
    }

    return {
        book: result.book,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        content: chapter.content,
        contentLength: chapter.contentLength
    };
};

module.exports = {
    downloadEpub,
    getBookChapters,
    getChapterContent
};
