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

// Kiem tra lich su co thuoc ve User dang dang nhap khong
const checkHistoryOwnership = async (req, res, historyId) => {
    const history = await readingHistoryService.getReadingHistoryById(historyId);

    if (!history) {
        res.status(404).json({
            success: false,
            message: "Khong tim thay lich su doc."
        });
        return null;
    }

    if (
        req.user.role !== "admin" &&
        Number(history.UserID) !== Number(req.user.userId)
    ) {
        res.status(403).json({
            success: false,
            message: "Ban khong co quyen truy cap lich su doc nay."
        });
        return null;
    }

    return history;
};

// GET /api/reading-history
const getAllReadingHistory = async (req, res) => {
    try {
        const userId = req.user.role === "admin"
            ? null
            : req.user.userId;

        const histories =
            await readingHistoryService.getAllReadingHistory(userId);

        return res.status(200).json({
            success: true,
            data: histories
        });
    } catch (error) {
        console.error("Loi lay lich su doc:", error.message);

        return res.status(500).json({
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

        const history = await checkHistoryOwnership(
            req,
            res,
            Number(req.params.id)
        );

        if (!history) return;

        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error("Loi lay chi tiet lich su:", error.message);

        return res.status(500).json({
            success: false,
            message: "Khong the lay chi tiet lich su doc."
        });
    }
};

// POST /api/reading-history
const createReadingHistory = async (req, res) => {
    try {
        const { BookID, LastReadPosition, ProgressPercent } = req.body;

        // UserID luon lay tu JWT neu la User
        let userId;

        if (req.user.role === "admin") {
            userId = req.body.UserID;

            if (!Number.isSafeInteger(userId) || userId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Admin phai cung cap UserID hop le."
                });
            }
        } else {
            userId = Number(req.user.userId);

            // Neu User gui UserID khac voi ID trong token thi tu choi
            if (
                Object.prototype.hasOwnProperty.call(req.body, "UserID") &&
                Number(req.body.UserID) !== userId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Ban khong the tao lich su cho tai khoan khac."
                });
            }
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
                UserID: userId,
                BookID,
                LastReadPosition: position,
                ProgressPercent: progress
            });

        return res.status(201).json({
            success: true,
            message: "Tao lich su doc thanh cong.",
            data: history
        });
    } catch (error) {
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({
                success: false,
                message: "Nguoi dung da co lich su cho cuon sach nay."
            });
        }

        if (error.number === 547) {
            return res.status(400).json({
                success: false,
                message: "UserID hoac BookID khong ton tai."
            });
        }

        console.error("Loi tao lich su doc:", error.message);

        return res.status(500).json({
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

        const historyId = Number(req.params.id);

        const existingHistory = await checkHistoryOwnership(
            req,
            res,
            historyId
        );

        if (!existingHistory) return;

        const userId = req.user.role === "admin"
            ? null
            : Number(req.user.userId);

        const history =
            await readingHistoryService.updateReadingHistory(
                historyId,
                { LastReadPosition, ProgressPercent },
                userId
            );

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay lich su doc."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cap nhat lich su doc thanh cong.",
            data: history
        });
    } catch (error) {
        console.error("Loi cap nhat lich su:", error.message);

        return res.status(500).json({
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

        const historyId = Number(req.params.id);

        const existingHistory = await checkHistoryOwnership(
            req,
            res,
            historyId
        );

        if (!existingHistory) return;

        const userId = req.user.role === "admin"
            ? null
            : Number(req.user.userId);

        const deleted =
            await readingHistoryService.deleteReadingHistory(
                historyId,
                userId
            );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay lich su doc."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xoa lich su doc thanh cong."
        });
    } catch (error) {
        console.error("Loi xoa lich su doc:", error.message);

        return res.status(500).json({
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