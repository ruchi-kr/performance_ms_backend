// db.js
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "performancems",
  timezone: "+5:30",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

module.exports = connection;
