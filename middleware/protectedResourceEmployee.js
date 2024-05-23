const jwt = require("jsonwebtoken");                               //importing jsonwebtoken
const  { JWT_SECRET } = require('../Config');                         //importing JWT_SECRET we created in config
const { StatusCodes } = require ( "http-status-codes");
const mysql = require("mysql");
const connection =require("../db");

module.exports = (req, res, next)=>{
  const {authorization} = req.headers;
  console.log("auth header for employee", authorization);
  if (authorization) {
    const token = authorization.replace("Bearer ", "");

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(StatusCodes.FORBIDDEN).send("Bad access token");
      }
      console.log("token verified fr employee");
      console.log("employee details after token verification",user)
      // req.user = user;
      // next();
       // Check user_type and role
       if (user.user_type == "0" && user.role == "employee") {
        req.user = user;
        next();
      } else {
        return res.status(StatusCodes.FORBIDDEN).send("Access denied");
      }
    });
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).send("Invalid jwt token");
  }
}

