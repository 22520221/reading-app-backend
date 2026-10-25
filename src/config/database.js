
const sql = require("mssql");

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || "localhost",
    database: process.env.DB_NAME || "ReadingAppDB",

    options: {
        instanceName: process.env.DB_INSTANCE || "SQLEXPRESS",
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate:
            process.env.DB_TRUST_SERVER_CERTIFICATE === "true"
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },

    connectionTimeout: 15000,
    requestTimeout: 15000
};

const pool = new sql.ConnectionPool(config);

const poolConnect = pool.connect();

poolConnect.catch((error) => {
    console.error("Loi ket noi MSSQL:", error.message);
});

module.exports = {
    sql,
    pool,
    poolConnect
};
