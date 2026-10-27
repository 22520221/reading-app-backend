const { sql, pool, poolConnect } = require("../config/database");

// GET: Lay danh sach lich su doc sach
const getAllReadingHistory = async () => {
    await poolConnect;

    const result = await pool.request().query(`
        SELECT
            rh.HistoryID,
            rh.UserID,
            u.FullName,
            rh.BookID,
            b.Title,
            b.Author,
            rh.LastReadPosition,
            rh.ProgressPercent,
            rh.LastReadAt,
            rh.CreatedAt,
            rh.UpdatedAt
        FROM dbo.ReadingHistory rh
        INNER JOIN dbo.Users u
            ON rh.UserID = u.UserID
        INNER JOIN dbo.Books b
            ON rh.BookID = b.BookID
        ORDER BY rh.LastReadAt DESC
    `);

    return result.recordset;
};

// GET: Lay chi tiet mot lich su doc sach
const getReadingHistoryById = async (id) => {
    await poolConnect;

    const result = await pool.request()
        .input("HistoryID", sql.Int, id)
        .query(`
            SELECT
                rh.HistoryID,
                rh.UserID,
                u.FullName,
                rh.BookID,
                b.Title,
                b.Author,
                rh.LastReadPosition,
                rh.ProgressPercent,
                rh.LastReadAt,
                rh.CreatedAt,
                rh.UpdatedAt
            FROM dbo.ReadingHistory rh
            INNER JOIN dbo.Users u
                ON rh.UserID = u.UserID
            INNER JOIN dbo.Books b
                ON rh.BookID = b.BookID
            WHERE rh.HistoryID = @HistoryID
        `);

    return result.recordset[0] || null;
};

// POST: Them lich su doc sach
const createReadingHistory = async (history) => {
    await poolConnect;

    const result = await pool.request()
        .input("UserID", sql.Int, history.UserID)
        .input("BookID", sql.Int, history.BookID)
        .input(
            "LastReadPosition",
            sql.BigInt,
            history.LastReadPosition ?? 0
        )
        .input(
            "ProgressPercent",
            sql.Decimal(5, 2),
            history.ProgressPercent ?? 0
        )
        .query(`
            INSERT INTO dbo.ReadingHistory (
                UserID,
                BookID,
                LastReadPosition,
                ProgressPercent
            )
            OUTPUT
                INSERTED.HistoryID,
                INSERTED.UserID,
                INSERTED.BookID,
                INSERTED.LastReadPosition,
                INSERTED.ProgressPercent,
                INSERTED.LastReadAt,
                INSERTED.CreatedAt,
                INSERTED.UpdatedAt
            VALUES (
                @UserID,
                @BookID,
                @LastReadPosition,
                @ProgressPercent
            )
        `);

    return result.recordset[0];
};

// PUT: Cap nhat vi tri va tien do doc
const updateReadingHistory = async (id, history) => {
    await poolConnect;

    const result = await pool.request()
        .input("HistoryID", sql.Int, id)
        .input(
            "LastReadPosition",
            sql.BigInt,
            history.LastReadPosition
        )
        .input(
            "ProgressPercent",
            sql.Decimal(5, 2),
            history.ProgressPercent
        )
        .query(`
            UPDATE dbo.ReadingHistory
            SET
                LastReadPosition = @LastReadPosition,
                ProgressPercent = @ProgressPercent,
                LastReadAt = SYSDATETIME(),
                UpdatedAt = SYSDATETIME()
            OUTPUT
                INSERTED.HistoryID,
                INSERTED.UserID,
                INSERTED.BookID,
                INSERTED.LastReadPosition,
                INSERTED.ProgressPercent,
                INSERTED.LastReadAt,
                INSERTED.CreatedAt,
                INSERTED.UpdatedAt
            WHERE HistoryID = @HistoryID
        `);

    return result.recordset[0] || null;
};

// DELETE: Xoa lich su doc sach
const deleteReadingHistory = async (id) => {
    await poolConnect;

    const result = await pool.request()
        .input("HistoryID", sql.Int, id)
        .query(`
            DELETE FROM dbo.ReadingHistory
            OUTPUT DELETED.HistoryID
            WHERE HistoryID = @HistoryID
        `);

    return result.recordset.length > 0;
};

module.exports = {
    getAllReadingHistory,
    getReadingHistoryById,
    createReadingHistory,
    updateReadingHistory,
    deleteReadingHistory
};
