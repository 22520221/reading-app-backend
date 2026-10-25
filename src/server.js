
require("dotenv").config();

const app = require("./app");
const { pool, poolConnect } = require("./config/database");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Chờ kết nối SQL Server
        await poolConnect;

        // Kiểm tra truy vấn SQL
        await pool.request().query("SELECT 1 AS connected");

        // Khởi động Express
        app.listen(PORT, "0.0.0.0", () => {
            console.log(
                `Backend dang chay tai http://localhost:${PORT}`
            );
            console.log("Ket noi MSSQL thanh cong!");
        });
    } catch (error) {
        console.error(
            "Khong the khoi dong Backend:",
            error.message
        );

        await pool.close().catch(() => {});
        process.exit(1);
    }
}

startServer();
