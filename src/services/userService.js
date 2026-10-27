const { sql, pool, poolConnect } = require("../config/database");
const bcrypt = require("bcryptjs");

// GET: Lay danh sach nguoi dung
const getAllUsers = async () => {
    await poolConnect;

    const result = await pool.request().query(`
        SELECT
            UserID,
            FullName,
            Email,
            Role,
            IsActive,
            CreatedAt,
            UpdatedAt
        FROM dbo.Users
        ORDER BY UserID DESC
    `);

    return result.recordset;
};

// GET: Lay chi tiet nguoi dung
const getUserById = async (id) => {
    await poolConnect;

    const result = await pool.request()
        .input("UserID", sql.Int, id)
        .query(`
            SELECT
                UserID,
                FullName,
                Email,
                Role,
                IsActive,
                CreatedAt,
                UpdatedAt
            FROM dbo.Users
            WHERE UserID = @UserID
        `);

    return result.recordset[0] || null;
};

// POST: Them nguoi dung
const createUser = async (user) => {
    await poolConnect;

    // Bam mat khau truoc khi luu vao database
    const passwordHash = await bcrypt.hash(user.Password, 10);

    const result = await pool.request()
        .input("FullName", sql.NVarChar(150), user.FullName.trim())
        .input("Email", sql.NVarChar(255), user.Email.trim().toLowerCase())
        .input("PasswordHash", sql.NVarChar(255), passwordHash)
        .input("Role", sql.NVarChar(20), user.Role || "user")
        .input("IsActive", sql.Bit, user.IsActive ?? true)
        .query(`
            INSERT INTO dbo.Users
                (FullName, Email, PasswordHash, Role, IsActive)
            OUTPUT
                INSERTED.UserID,
                INSERTED.FullName,
                INSERTED.Email,
                INSERTED.Role,
                INSERTED.IsActive,
                INSERTED.CreatedAt,
                INSERTED.UpdatedAt
            VALUES
                (@FullName, @Email, @PasswordHash, @Role, @IsActive)
        `);

    return result.recordset[0];
};

// PUT: Cap nhat nguoi dung
const updateUser = async (id, user) => {
    await poolConnect;

    const request = pool.request()
        .input("UserID", sql.Int, id)
        .input("FullName", sql.NVarChar(150), user.FullName.trim())
        .input("Email", sql.NVarChar(255), user.Email.trim().toLowerCase())
        .input("Role", sql.NVarChar(20), user.Role)
        .input("IsActive", sql.Bit, user.IsActive);

    let passwordSql = "";

    // Chi doi mat khau neu client gui Password khong rong
    if (user.Password) {
        const passwordHash = await bcrypt.hash(user.Password, 10);

        request.input(
            "PasswordHash",
            sql.NVarChar(255),
            passwordHash
        );

        passwordSql = ", PasswordHash = @PasswordHash";
    }

    const result = await request.query(`
        UPDATE dbo.Users
        SET
            FullName = @FullName,
            Email = @Email,
            Role = @Role,
            IsActive = @IsActive,
            UpdatedAt = SYSDATETIME()
            ${passwordSql}
        OUTPUT
            INSERTED.UserID,
            INSERTED.FullName,
            INSERTED.Email,
            INSERTED.Role,
            INSERTED.IsActive,
            INSERTED.CreatedAt,
            INSERTED.UpdatedAt
        WHERE UserID = @UserID
    `);

    return result.recordset[0] || null;
};

// DELETE: Xoa nguoi dung
const deleteUser = async (id) => {
    await poolConnect;

    const result = await pool.request()
        .input("UserID", sql.Int, id)
        .query(`
            DELETE FROM dbo.Users
            OUTPUT DELETED.UserID
            WHERE UserID = @UserID
        `);

    return result.recordset.length > 0;
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
