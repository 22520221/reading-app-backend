
const express = require("express");
const cors = require("cors");
const { pool, poolConnect } = require("./config/database");

const categoryRoutes = require("./routes/categoryRoutes");
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const readingHistoryRoutes = require("./routes/readingHistoryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend dang hoat dong!"
    });
});

app.get("/api/health/db", async (req, res) => {
    try {
        await poolConnect;

        const result = await pool.request().query(`
            SELECT
                DB_NAME() AS database_name,
                @@SERVERNAME AS server_name
        `);

        res.json({
            success: true,
            message: "Ket noi MSSQL thanh cong!",
            database: result.recordset[0].database_name,
            server: result.recordset[0].server_name
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Khong the ket noi MSSQL."
        });
    }
});

// Đăng ký API Categories
app.use("/api/categories", categoryRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reading-history", readingHistoryRoutes);

module.exports = app;
