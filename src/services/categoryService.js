
const { sql, pool, poolConnect } = require("../config/database");

// GET: Lay danh sach danh muc
const getAllCategories = async () => {
    await poolConnect;

    const result = await pool.request().query(`
        SELECT
            CategoryID,
            CategoryName,
            Description,
            CreatedAt
        FROM dbo.Categories
        ORDER BY CategoryID DESC
    `);

    return result.recordset;
};

// GET: Lay chi tiet danh muc
const getCategoryById = async (id) => {
    await poolConnect;

    const result = await pool.request()
        .input("CategoryID", sql.Int, id)
        .query(`
            SELECT
                CategoryID,
                CategoryName,
                Description,
                CreatedAt
            FROM dbo.Categories
            WHERE CategoryID = @CategoryID
        `);

    return result.recordset[0] || null;
};

// POST: Them danh muc
const createCategory = async (category) => {
    await poolConnect;

    const result = await pool.request()
        .input(
            "CategoryName",
            sql.NVarChar(100),
            category.CategoryName.trim()
        )
        .input(
            "Description",
            sql.NVarChar(sql.MAX),
            category.Description ?? null
        )
        .query(`
            INSERT INTO dbo.Categories (
                CategoryName,
                Description
            )
            OUTPUT
                INSERTED.CategoryID,
                INSERTED.CategoryName,
                INSERTED.Description,
                INSERTED.CreatedAt
            VALUES (
                @CategoryName,
                @Description
            )
        `);

    return result.recordset[0];
};

// PUT: Cap nhat danh muc
const updateCategory = async (id, category) => {
    await poolConnect;

    const result = await pool.request()
        .input("CategoryID", sql.Int, id)
        .input(
            "CategoryName",
            sql.NVarChar(100),
            category.CategoryName.trim()
        )
        .input(
            "Description",
            sql.NVarChar(sql.MAX),
            category.Description ?? null
        )
        .query(`
            UPDATE dbo.Categories
            SET
                CategoryName = @CategoryName,
                Description = @Description
            WHERE CategoryID = @CategoryID;

            SELECT
                CategoryID,
                CategoryName,
                Description,
                CreatedAt
            FROM dbo.Categories
            WHERE CategoryID = @CategoryID;
        `);

    return result.recordset[0] || null;
};

// DELETE: Xoa danh muc
const deleteCategory = async (id) => {
    await poolConnect;

    const result = await pool.request()
        .input("CategoryID", sql.Int, id)
        .query(`
            DELETE FROM dbo.Categories
            OUTPUT DELETED.CategoryID
            WHERE CategoryID = @CategoryID
        `);

    return result.recordset.length > 0;
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
