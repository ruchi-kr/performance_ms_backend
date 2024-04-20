const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mysql = require("mysql");

const app = express();
const port = 8000;


app.use(cors());
app.use(express.json());

app.use(morgan("tiny"));

//MySQL connection
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'performancems'
//   });
  
//   connection.connect(err => {
//     if (err) throw err;
//     console.log('Connected to MySQL database');
//   });


  app.use(require('./Routes/Auth_route'));
  app.use(require('./Routes/Employeemaster_route'));
  app.use(require('./Routes/usermaster_route'));
  app.use(require('./Routes/rm_master_route'));
  app.use(require('./Routes/projectmaster_route'));








app.listen( port, ()=>{
    console.log(`Listening on port ${port}`);
})
