// db.js
const mysql = require("mysql");

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "performancems",
//   time_zone: "+5:30",
  
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log("Connected to MySQL database");
// });

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "performancems",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
  // '+05:30'
  connection.query("SET GLOBAL time_zone = '+00:00';", (err, results) => {
    if(err){
      console.log("error connecting to database", err);
    }
    else{
      console.log("Time zone set GLOBAL time_zone = '+00:00'");
    }
    
  });
});

module.exports = connection;
