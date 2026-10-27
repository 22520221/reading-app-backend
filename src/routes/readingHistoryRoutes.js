const express = require("express");
const router = express.Router();

const readingHistoryController =
    require("../controllers/readingHistoryController");

router.get("/", readingHistoryController.getAllReadingHistory);
router.get("/:id", readingHistoryController.getReadingHistoryById);
router.post("/", readingHistoryController.createReadingHistory);
router.put("/:id", readingHistoryController.updateReadingHistory);
router.delete("/:id", readingHistoryController.deleteReadingHistory);

module.exports = router;
