// db.js
require("dotenv").config();
const mysql = require("mysql2/promise");

// Create MySQL connection pool
const pool = mysql.createPool({
  // host: "localhost",
  // user: "root",
  // password: "",
  // database: "performancems",
  timezone: "+00:00",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Exporting the pool so it can be used in other parts of the application
module.exports = pool;
