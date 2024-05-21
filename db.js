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


