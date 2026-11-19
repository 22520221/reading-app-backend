
const epubService = require("../services/epubService");

// Lấy danh sách chương
const getBookChapters = async (req, res) => {
    try {
        const bookId = Number(req.params.id);

        if (!Number.isInteger(bookId) || bookId <= 0) {
            return res.status(400).json({
                success: false,
                message: "BookID khong hop le"
            });
        }

        const data = await epubService.getBookChapters(bookId);

        return res.status(200).json({
            success: true,
            message: "Lay danh sach chuong thanh cong",
            data
        });

    } catch (error) {
        console.error("Loi lay danh sach chuong:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Loi server"
        });
    }
};

// Lấy nội dung một chương
const getChapterContent = async (req, res) => {
    try {
        const bookId = Number(req.params.id);
        const chapterNumber = Number(req.params.chapterNumber);

        if (!Number.isInteger(bookId) || bookId <= 0) {
            return res.status(400).json({
                success: false,
                message: "BookID khong hop le"
            });
        }

        const data = await epubService.getChapterContent(
            bookId,
            chapterNumber
        );

        return res.status(200).json({
            success: true,
            message: "Lay noi dung chuong thanh cong",
            data
        });

    } catch (error) {
        console.error("Loi lay noi dung chuong:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Loi server"
        });
    }
};

module.exports = {
    getBookChapters,
    getChapterContent
};
