const express = require("express");
const router = express.Router();

const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middlewares/authMiddleware");

// ADMIN va USER: xem danh sach danh muc
router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin", "user"),
    getAllCategories
);

// ADMIN va USER: xem chi tiet danh muc
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "user"),
    getCategoryById
);

// CHI ADMIN: them danh muc
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    createCategory
);

// CHI ADMIN: cap nhat danh muc
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    updateCategory
);

// CHI ADMIN: xoa danh muc
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteCategory
);

module.exports = router;
