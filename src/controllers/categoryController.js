
const categoryService = require("../services/categoryService");

// Kiem tra ID
const parseCategoryId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

// GET /api/categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();

        return res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Loi getAllCategories:", error.message);

        return res.status(500).json({
            success: false,
            message: "Loi khi lay danh sach danh muc."
        });
    }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
    try {
        const id = parseCategoryId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "CategoryID phai la so nguyen duong."
            });
        }

        const category = await categoryService.getCategoryById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay danh muc."
            });
        }

        return res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error("Loi getCategoryById:", error.message);

        return res.status(500).json({
            success: false,
            message: "Loi khi lay chi tiet danh muc."
        });
    }
};

// POST /api/categories
const createCategory = async (req, res) => {
    try {
        const { CategoryName, Description } = req.body;

        if (
            typeof CategoryName !== "string" ||
            CategoryName.trim().length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "CategoryName la bat buoc."
            });
        }

        if (CategoryName.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "CategoryName khong duoc vuot qua 100 ky tu."
            });
        }

        if (
            Description !== undefined &&
            Description !== null &&
            typeof Description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Description phai la chuoi hoac null."
            });
        }

        const category = await categoryService.createCategory({
            CategoryName,
            Description
        });

        return res.status(201).json({
            success: true,
            message: "Them danh muc thanh cong!",
            data: category
        });
    } catch (error) {
        console.error("Loi createCategory:", error.message);

        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({
                success: false,
                message: "Danh muc da ton tai."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Loi khi them danh muc."
        });
    }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
    try {
        const id = parseCategoryId(req.params.id);
        const { CategoryName, Description } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "CategoryID phai la so nguyen duong."
            });
        }

        if (
            typeof CategoryName !== "string" ||
            CategoryName.trim().length === 0 ||
            CategoryName.trim().length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "CategoryName la bat buoc va toi da 100 ky tu."
            });
        }

        if (
            Description !== undefined &&
            Description !== null &&
            typeof Description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Description phai la chuoi hoac null."
            });
        }

        const category = await categoryService.updateCategory(id, {
            CategoryName,
            Description
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay danh muc de cap nhat."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cap nhat danh muc thanh cong!",
            data: category
        });
    } catch (error) {
        console.error("Loi updateCategory:", error.message);

        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({
                success: false,
                message: "Ten danh muc da ton tai."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Loi khi cap nhat danh muc."
        });
    }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    try {
        const id = parseCategoryId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "CategoryID phai la so nguyen duong."
            });
        }

        const deleted = await categoryService.deleteCategory(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay danh muc de xoa."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xoa danh muc thanh cong!"
        });
    } catch (error) {
        console.error("Loi deleteCategory:", error.message);

        return res.status(500).json({
            success: false,
            message: "Loi khi xoa danh muc."
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};

