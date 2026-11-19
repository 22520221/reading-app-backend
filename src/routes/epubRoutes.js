
const express = require("express");
const router = express.Router();

const epubController = require("../controllers/epubController");

// Lấy danh sách chương của sách
router.get(
    "/:id/chapters",
    epubController.getBookChapters
);

// Lấy nội dung một chương cụ thể
router.get(
    "/:id/chapters/:chapterNumber",
    epubController.getChapterContent
);

module.exports = router;
