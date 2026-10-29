const bcrypt = require("bcryptjs");
const { sql, pool, poolConnect } = require("../config/database");

async function login(email, password) {
    await poolConnect;

    const result = await pool
        .request()
        .input("Email", sql.NVarChar(255), email)
        .query(`
            SELECT
                UserID,
                FullName,
                Email,
                PasswordHash,
                Role,
                IsActive
            FROM dbo.Users
            WHERE Email = @Email
        `);

    const user = result.recordset[0];

    // Không tìm thấy tài khoản
    if (!user) {
        return null;
    }

    // Tài khoản bị khóa
    if (!user.IsActive) {
        return { error: "ACCOUNT_DISABLED" };
    }

    // Kiểm tra mật khẩu với bcrypt
    const isPasswordValid = await bcrypt.compare(
        password,
        user.PasswordHash
    );

    if (!isPasswordValid) {
        return null;
    }

    // Không trả PasswordHash về client
    return {
        UserID: user.UserID,
        FullName: user.FullName,
        Email: user.Email,
        Role: user.Role
    };
}

module.exports = { login };
