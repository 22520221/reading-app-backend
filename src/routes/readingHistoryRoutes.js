const express = require("express");
const router = express.Router();

const readingHistoryController =
    require("../controllers/readingHistoryController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middlewares/authMiddleware");

// Admin va User: xem lich su doc
router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin", "user"),
    readingHistoryController.getAllReadingHistory
);

// Admin va User: xem chi tiet
// Controller se kiem tra quyen so huu
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "user"),
    readingHistoryController.getReadingHistoryById
);

// Admin va User: tao lich su doc
// UserID cua User duoc lay tu JWT
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "user"),
    readingHistoryController.createReadingHistory
);

// Admin va User: cap nhat lich su doc
// Controller va Service kiem tra quyen so huu
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "user"),
    readingHistoryController.updateReadingHistory
);

// Admin va User: xoa lich su doc
// Controller va Service kiem tra quyen so huu
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "user"),
    readingHistoryController.deleteReadingHistory
);

module.exports = router;
