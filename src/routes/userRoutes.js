const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const {
    authenticateToken,
    authorizeRoles,
    authorizeSelfOrAdmin
} = require("../middlewares/authMiddleware");

// CHI ADMIN: xem danh sach nguoi dung
router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    userController.getAllUsers
);

// ADMIN: xem moi tai khoan
// USER: chi xem tai khoan cua minh
router.get(
    "/:id",
    authenticateToken,
    authorizeSelfOrAdmin,
    userController.getUserById
);

// CHI ADMIN: them nguoi dung
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    userController.createUser
);

// ADMIN: cap nhat moi tai khoan
// USER: chi cap nhat tai khoan cua minh
router.put(
    "/:id",
    authenticateToken,
    authorizeSelfOrAdmin,
    userController.updateUser
);

// CHI ADMIN: xoa nguoi dung
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    userController.deleteUser
);

module.exports = router;