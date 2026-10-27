const readingHistoryService = require("../services/readingHistoryService");

const isValidId = (id) =>
    /^\d+$/.test(String(id)) &&
    Number.isSafeInteger(Number(id)) &&
    Number(id) > 0;

const isValidProgress = (value) =>
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100;

const isValidPosition = (value) =>
    Number.isSafeInteger(value) && value >= 0;

// GET /api/reading-history
const getAllReadingHistory = async (req, res) => {
    try {
        const histories =
            await readingHistoryService.getAllReadingHistory();

        res.status(200).json({
            success: true,
            data: histories
        });
    } catch (error) {
        console.error("Loi lay lich su doc:", error.message);

        res.status(500).json({
            success: false,
            message: "Khong the lay danh sach lich su doc."
        });
    }
};

// GET /api/reading-history/:id
const getReadingHistoryById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "HistoryID khong hop le."
            });
        }

        const history =
            await readingHistoryService.getReadingHistoryById(
                Number(req.params.id)
            );

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay lich su doc."
            });
        }

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error("Loi lay chi tiet lich su:", error.message);

        res.status(500).json({
            success: false,
            message: "Khong the lay chi tiet lich su doc."
        });
    }
};

// POST /api/reading-history
const createReadingHistory = async (req, res) => {
    try {
        const {
            UserID,
            BookID,
            LastReadPosition,
            ProgressPercent
        } = req.body;

        if (!Number.isSafeInteger(UserID) || UserID <= 0) {
            return res.status(400).json({
                success: false,
                message: "UserID phai la so nguyen duong."
            });
        }

        if (!Number.isSafeInteger(BookID) || BookID <= 0) {
            return res.status(400).json({
                success: false,
                message: "BookID phai la so nguyen duong."
            });
        }

        const position = LastReadPosition ?? 0;
        const progress = ProgressPercent ?? 0;

        if (!isValidPosition(position)) {
            return res.status(400).json({
                success: false,
                message: "LastReadPosition phai la so nguyen khong am."
            });
        }

        if (!isValidProgress(progress)) {
            return res.status(400).json({
                success: false,
                message: "ProgressPercent phai la so tu 0 den 100."
            });
        }

        const history =
            await readingHistoryService.createReadingHistory({
                UserID,
                BookID,
                LastReadPosition: position,
                ProgressPercent: progress
            });

        res.status(201).json({
            success: true,
            message: "Tao lich su doc thanh cong.",
            data: history
        });
    } catch (error) {
        // SQL Server: duplicate key
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({
                success: false,
                message: "Nguoi dung da co lich su cho cuon sach nay."
            });
        }

        // SQL Server: foreign key violation
        if (error.number === 547) {
            return res.status(400).json({
                success: false,
                message: "UserID hoac BookID khong ton tai."
            });
        }

        console.error("Loi tao lich su doc:", error.message);

        res.status(500).json({
            success: false,
            message: "Khong the tao lich su doc."
        });
    }
};

// PUT /api/reading-history/:id
const updateReadingHistory = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "HistoryID khong hop le."
            });
        }

        const { LastReadPosition, ProgressPercent } = req.body;

        if (!isValidPosition(LastReadPosition)) {
            return res.status(400).json({
                success: false,
                message: "LastReadPosition phai la so nguyen khong am."
            });
        }

        if (!isValidProgress(ProgressPercent)) {
            return res.status(400).json({
                success: false,
                message: "ProgressPercent phai la so tu 0 den 100."
            });
        }

        const history =
            await readingHistoryService.updateReadingHistory(
                Number(req.params.id),
                { LastReadPosition, ProgressPercent }
            );

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay lich su doc."
            });
        }

        res.status(200).json({
            success: true,
            message: "Cap nhat lich su doc thanh cong.",
            data: history
        });
    } catch (error) {
        console.error("Loi cap nhat lich su doc:", error.message);

        res.status(500).json({
            success: false,
            message: "Khong the cap nhat lich su doc."
        });
    }
};

// DELETE /api/reading-history/:id
const deleteReadingHistory = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "HistoryID khong hop le."
            });
        }

        const deleted =
            await readingHistoryService.deleteReadingHistory(
                Number(req.params.id)
            );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay lich su doc."
            });
        }

        res.status(200).json({
            success: true,
            message: "Xoa lich su doc thanh cong."
        });
    } catch (error) {
        console.error("Loi xoa lich su doc:", error.message);

        res.status(500).json({
            success: false,
            message: "Khong the xoa lich su doc."
        });
    }
};

module.exports = {
    getAllReadingHistory,
    getReadingHistoryById,
    createReadingHistory,
    updateReadingHistory,
    deleteReadingHistory
};
