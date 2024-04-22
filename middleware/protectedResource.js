const jwt = require("jsonwebtoken");                               //importing jsonwebtoken
const  { JWT_SECRET } = require('../Config');                         //importing JWT_SECRET we created in config
const { StatusCodes } = require ( "http-status-codes");
const mysql = require("mysql");

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'performancems'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});



module.exports = (req, res, next)=>{
  const {authorization} = req.headers;
  console.log("auth header", authorization);
  if (authorization) {
    const token = authorization.replace("Bearer ", "");

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(StatusCodes.FORBIDDEN).send("Bad access token");
      }
      console.log("token verified");
      req.user = user;
      next();
    });
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).send("Invalid jwt token");
  }
}

