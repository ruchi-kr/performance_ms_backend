const mysql = require("mysql");
require("dotenv").config();
const connection = mysql.createConnection({
  timezone: "+00:00",
  host:process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
  
});

module.exports = connection;

