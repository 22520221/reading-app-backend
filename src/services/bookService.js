
const { sql, pool, poolConnect } = require("../config/database");

// GET: Lay danh sach sach
const getAllBooks = async () => {
    await poolConnect;

    const result = await pool.request().query(`
        SELECT
            b.BookID,
            b.Title,
            b.Author,
            b.Description,
            b.CategoryID,
            c.CategoryName,
            b.Language,
            b.EpubStoragePath,
            b.EpubOriginalName,
            b.EpubSizeBytes,
            b.CoverImagePath,
            b.CreatedAt,
            b.UpdatedAt
        FROM dbo.Books b
        LEFT JOIN dbo.Categories c
            ON b.CategoryID = c.CategoryID
        ORDER BY b.BookID DESC
    `);

    return result.recordset;
};

// GET: Lay chi tiet sach
const getBookById = async (id) => {
    await poolConnect;

    const result = await pool.request()
        .input("BookID", sql.Int, id)
        .query(`
            SELECT
                b.BookID,
                b.Title,
                b.Author,
                b.Description,
                b.CategoryID,
                c.CategoryName,
                b.Language,
                b.EpubStoragePath,
                b.EpubOriginalName,
                b.EpubSizeBytes,
                b.CoverImagePath,
                b.CreatedAt,
                b.UpdatedAt
            FROM dbo.Books b
            LEFT JOIN dbo.Categories c
                ON b.CategoryID = c.CategoryID
            WHERE b.BookID = @BookID
        `);

    return result.recordset[0] || null;
};

// POST: Them sach
const createBook = async (book) => {
    await poolConnect;

    const result = await pool.request()
        .input("Title", sql.NVarChar(250), book.Title.trim())
        .input("Author", sql.NVarChar(200), book.Author?.trim() || null)
        .input("Description", sql.NVarChar(sql.MAX), book.Description ?? null)
        .input("CategoryID", sql.Int, book.CategoryID)
        .input("Language", sql.NVarChar(10), book.Language?.trim() || null)
        .query(`
            INSERT INTO dbo.Books (
                Title,
                Author,
                Description,
                CategoryID,
                Language
            )
            OUTPUT INSERTED.BookID
            VALUES (
                @Title,
                @Author,
                @Description,
                @CategoryID,
                @Language
            )
        `);

    return {
        BookID: result.recordset[0].BookID,
        ...book,
        Title: book.Title.trim(),
        Author: book.Author?.trim() || null,
        Language: book.Language?.trim() || null
    };
};

// PUT: Cap nhat sach
const updateBook = async (id, book) => {
    await poolConnect;

    const result = await pool.request()
        .input("BookID", sql.Int, id)
        .input("Title", sql.NVarChar(250), book.Title.trim())
        .input("Author", sql.NVarChar(200), book.Author?.trim() || null)
        .input("Description", sql.NVarChar(sql.MAX), book.Description ?? null)
        .input("CategoryID", sql.Int, book.CategoryID)
        .input("Language", sql.NVarChar(10), book.Language?.trim() || null)
        .query(`
            UPDATE dbo.Books
            SET
                Title = @Title,
                Author = @Author,
                Description = @Description,
                CategoryID = @CategoryID,
                Language = @Language,
                UpdatedAt = SYSDATETIME()
            OUTPUT INSERTED.BookID
            WHERE BookID = @BookID
        `);

    return result.recordset[0] || null;
};

// DELETE: Xoa sach
const deleteBook = async (id) => {
    await poolConnect;

    const result = await pool.request()
        .input("BookID", sql.Int, id)
        .query(`
            DELETE FROM dbo.Books
            OUTPUT DELETED.BookID
            WHERE BookID = @BookID
        `);

    return result.recordset.length > 0;
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
