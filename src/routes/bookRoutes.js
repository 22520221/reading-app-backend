const express = require("express");
const router = express.Router();

const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} = require("../controllers/bookController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middlewares/authMiddleware");

// ADMIN va USER: xem danh sach sach
router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin", "user"),
    getAllBooks
);

// ADMIN va USER: xem chi tiet sach
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "user"),
    getBookById
);

// CHI ADMIN: them sach
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    createBook
);

// CHI ADMIN: cap nhat sach
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    updateBook
);

// CHI ADMIN: xoa sach
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteBook
);

module.exports = router;
