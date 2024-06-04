const mysql = require("mysql");
require("dotenv").config();
const connection = mysql.createConnection({
  
  // user: "root",
  // password: "",
  // database: "performancems",
  timezone: "+00:00",
  host:process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// connection.connect((err) => {
//   if (err) throw err;
//   console.log("Connected to MySQL database");
// });

// const connection = mysql.createConnection({
//   host: process.env.HOST,
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   database: process.env.DATABASE,
//   port: process.env.PORT
// });

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
  // '+00:00'
  // connection.query("SET GLOBAL time_zone = '+00:00';", (err, results) => {
  //   if(err){
  //     console.log("error connecting to database", err);
  //   }
  //   else{
  //     console.log("Time zone set GLOBAL time_zone = '+00:00'");
  //   }

  // });
});

module.exports = connection;

// const mysql = require("mysql");

// const connection = mysql.createConnection({
//   host: "62.72.28.242",
//   port: "65002",
//   user:"u767023103_intilqpq_icar3",
//   password: "&H(hE$=BL9!D",
//   database: "u767023103_icar3",
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log("Connected to MySQL database");
//   connection.query("SET GLOBAL time_zone = '+00:00';", (err, results) => {
//     if (err) {
//       console.log("error connecting to database", err);
//     } else {
//       console.log("Time zone set GLOBAL time_zone = '+00:00'");
//     }
//   });
// });

// module.exports = connection;
