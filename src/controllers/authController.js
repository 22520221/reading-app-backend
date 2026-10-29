const jwt = require("jsonwebtoken");
const authService = require("../services/authService");

async function login(req, res) {
    try {
        const { Email, Password } = req.body;

        if (
            typeof Email !== "string" ||
            typeof Password !== "string" ||
            !Email.trim() ||
            !Password
        ) {
            return res.status(400).json({
                message: "Vui long nhap Email va Password"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("Chua cau hinh JWT_SECRET trong .env");

            return res.status(500).json({
                message: "Backend chua duoc cau hinh JWT"
            });
        }

        const user = await authService.login(
            Email.trim(),
            Password
        );

        if (user?.error === "ACCOUNT_DISABLED") {
            return res.status(403).json({
                message: "Tai khoan da bi vo hieu hoa"
            });
        }

        if (!user) {
            return res.status(401).json({
                message: "Email hoac mat khau khong dung"
            });
        }

        const token = jwt.sign(
            {
                userId: user.UserID,
                role: user.Role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1h"
            }
        );

        return res.status(200).json({
            message: "Dang nhap thanh cong",
            token,
            user
        });
    } catch (error) {
        console.error("Loi dang nhap:", error.message);

        return res.status(500).json({
            message: "Loi server khi dang nhap"
        });
    }
}

module.exports = { login };
