
const { sql, pool, poolConnect } = require("../config/database");

// GET: Lấy danh sách thể loại
async function getAllCategories(req, res) {
    try {
        await poolConnect;

        const result = await pool.request().query(`
            SELECT CategoryID, CategoryName, Description, CreatedAt
            FROM dbo.Categories
            ORDER BY CategoryID DESC
        `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Loi khi lay danh sach the loai."
        });
    }
}

// GET: Lấy chi tiết một thể loại
async function getCategoryById(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "CategoryID khong hop le."
            });
        }

        await poolConnect;

        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT CategoryID, CategoryName, Description, CreatedAt
                FROM dbo.Categories
                WHERE CategoryID = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay the loai."
            });
        }

        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Loi khi lay chi tiet the loai."
        });
    }
}

// POST: Thêm thể loại
async function createCategory(req, res) {
    try {
        const { CategoryName, Description } = req.body;

        if (
            typeof CategoryName !== "string" ||
            CategoryName.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "CategoryName khong duoc de trong."
            });
        }

        const name = CategoryName.trim();
        const description =
            typeof Description === "string" && Description.trim() !== ""
                ? Description.trim()
                : null;

        if (name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Ten the loai toi da 100 ky tu."
            });
        }

        if (description && description.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Mo ta toi da 500 ky tu."
            });
        }

        await poolConnect;

        const result = await pool.request()
            .input("CategoryName", sql.NVarChar(100), name)
            .input("Description", sql.NVarChar(500), description)
            .query(`
                INSERT INTO dbo.Categories (CategoryName, Description)
                OUTPUT
                    INSERTED.CategoryID,
                    INSERTED.CategoryName,
                    INSERTED.Description,
                    INSERTED.CreatedAt
                VALUES (@CategoryName, @Description)
            `);

        res.status(201).json({
            success: true,
            message: "Them the loai thanh cong.",
            data: result.recordset[0]
        });
    } catch (error) {
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({
                success: false,
                message: "Ten the loai da ton tai."
            });
        }

        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Loi khi them the loai."
        });
    }
}

// PUT: Cập nhật thể loại
async function updateCategory(req, res) {
    try {
        const id = Number(req.params.id);
        const { CategoryName, Description } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "CategoryID khong hop le."
            });
        }

        if (
            typeof CategoryName !== "string" ||
            CategoryName.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "CategoryName khong duoc de trong."
            });
        }

        const name = CategoryName.trim();
        const description =
            typeof Description === "string" && Description.trim() !== ""
                ? Description.trim()
                : null;

        if (name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Ten the loai toi da 100 ky tu."
            });
        }

        if (description && description.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Mo ta toi da 500 ky tu."
            });
        }

        await poolConnect;

        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("CategoryName", sql.NVarChar(100), name)
            .input("Description", sql.NVarChar(500), description)
            .query(`
                UPDATE dbo.Categories
                SET CategoryName = @CategoryName,
                    Description = @Description
                WHERE CategoryID = @id;

                SELECT CategoryID, CategoryName, Description, CreatedAt
                FROM dbo.Categories
                WHERE CategoryID = @id;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay the loai."
            });
        }

        res.json({
            success: true,
            message: "Cap nhat the loai thanh cong.",
            data: result.recordset[0]
        });
    } catch (error) {
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({
                success: false,
                message: "Ten the loai da ton tai."
            });
        }

        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Loi khi cap nhat the loai."
        });
    }
}

// DELETE: Xóa thể loại
async function deleteCategory(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "CategoryID khong hop le."
            });
        }

        await poolConnect;

        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                DELETE FROM dbo.Categories
                WHERE CategoryID = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay the loai."
            });
        }

        res.json({
            success: true,
            message: "Xoa the loai thanh cong."
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Loi khi xoa the loai."
        });
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
