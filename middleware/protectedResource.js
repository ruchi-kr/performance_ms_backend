const jwt = require("jsonwebtoken");                               //importing jsonwebtoken
const  { JWT_SECRET } = require('../Config');                         //importing JWT_SECRET we created in config
const { StatusCodes } = require ( "http-status-codes");
const mysql = require("mysql");
const connection =require("../db");



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

