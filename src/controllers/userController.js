const userService = require("../services/userService");

const isValidId = (id) =>
    /^\d+$/.test(String(id)) &&
    Number.isSafeInteger(Number(id)) &&
    Number(id) > 0;

const isValidRole = (role) =>
    ["admin", "user"].includes(role);

const isDuplicateEmail = (error) =>
    error.number === 2627 ||
    error.number === 2601;

// GET /api/users
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Loi lay danh sach users:", error.message);

        res.status(500).json({
            success: false,
            message: "Khong the lay danh sach nguoi dung."
        });
    }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "UserID khong hop le."
            });
        }

        const user = await userService.getUserById(
            Number(req.params.id)
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay nguoi dung."
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Loi lay chi tiet user:", error.message);

        res.status(500).json({
            success: false,
            message: "Khong the lay thong tin nguoi dung."
        });
    }
};

// POST /api/users
const createUser = async (req, res) => {
    try {
        const { FullName, Email, Password, Role, IsActive } = req.body;

        if (
            typeof FullName !== "string" ||
            !FullName.trim() ||
            FullName.trim().length > 150
        ) {
            return res.status(400).json({
                success: false,
                message: "FullName la bat buoc va toi da 150 ky tu."
            });
        }

        if (
            typeof Email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email.trim()) ||
            Email.trim().length > 255
        ) {
            return res.status(400).json({
                success: false,
                message: "Email khong hop le."
            });
        }

        if (
            typeof Password !== "string" ||
            Password.length < 8 ||
            Password.length > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Password phai co tu 8 den 72 ky tu."
            });
        }

        const normalizedRole = Role ?? "user";

        if (!isValidRole(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message: "Role chi duoc la admin hoac user."
            });
        }

        if (
            IsActive !== undefined &&
            typeof IsActive !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "IsActive phai la true hoac false."
            });
        }

        const user = await userService.createUser({
            FullName,
            Email,
            Password,
            Role: normalizedRole,
            IsActive
        });

        res.status(201).json({
            success: true,
            message: "Tao nguoi dung thanh cong.",
            data: user
        });
    } catch (error) {
        if (isDuplicateEmail(error)) {
            return res.status(409).json({
                success: false,
                message: "Email da ton tai."
            });
        }

        console.error("Loi tao user:", error.message);

        res.status(500).json({
            success: false,
            message: "Khong the tao nguoi dung."
        });
    }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "UserID khong hop le."
            });
        }

        const { FullName, Email, Password, Role, IsActive } = req.body;

        if (
            typeof FullName !== "string" ||
            !FullName.trim() ||
            FullName.trim().length > 150
        ) {
            return res.status(400).json({
                success: false,
                message: "FullName la bat buoc va toi da 150 ky tu."
            });
        }

        if (
            typeof Email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email.trim()) ||
            Email.trim().length > 255
        ) {
            return res.status(400).json({
                success: false,
                message: "Email khong hop le."
            });
        }

        if (!isValidRole(Role)) {
            return res.status(400).json({
                success: false,
                message: "Role chi duoc la admin hoac user."
            });
        }

        if (typeof IsActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "IsActive phai la true hoac false."
            });
        }

        if (
            Password !== undefined &&
            Password !== "" &&
            (typeof Password !== "string" ||
                Password.length < 8 ||
                Password.length > 72)
        ) {
            return res.status(400).json({
                success: false,
                message: "Password moi phai co tu 8 den 72 ky tu."
            });
        }

        const user = await userService.updateUser(
            Number(req.params.id),
            { FullName, Email, Password, Role, IsActive }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay nguoi dung."
            });
        }

        res.status(200).json({
            success: true,
            message: "Cap nhat nguoi dung thanh cong.",
            data: user
        });
    } catch (error) {
        if (isDuplicateEmail(error)) {
            return res.status(409).json({
                success: false,
                message: "Email da duoc su dung boi tai khoan khac."
            });
        }

        console.error("Loi cap nhat user:", error.message);

        res.status(500).json({
            success: false,
            message: "Khong the cap nhat nguoi dung."
        });
    }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "UserID khong hop le."
            });
        }

        const deleted = await userService.deleteUser(
            Number(req.params.id)
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay nguoi dung."
            });
        }

        res.status(200).json({
            success: true,
            message: "Xoa nguoi dung thanh cong."
        });
    } catch (error) {
        console.error("Loi xoa user:", error.message);

        res.status(500).json({
            success: false,
            message: "Khong the xoa nguoi dung."
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
