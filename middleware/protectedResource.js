const jwt = require("jsonwebtoken");                               //importing jsonwebtoken
const  { JWT_SECRET } = require('../Config');                         //importing JWT_SECRET we created in config
import { StatusCodes } from "http-status-codes";

module.exports = (req, res, next)=>{
  const authHeader = req.headers.authorization;
  console.log("auth header", authHeader);
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(StatusCodes.FORBIDDEN).send("Bad access token");
      }
      console.log("token verified");
      // req.user = user;
      next();
    });
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).send("Invalid jwt token");
  }
}

// module.exports = (req, res, next)=>{
//     const {authorization} = req.headers;
    
//     if(!authorization){
//       return res.status(401).json({error: "User not logged in"});
//     }
//     const token = authorization.replace("Bearer ", "");
    
//     connection.query('SELECT * FROM users WHERE token = ?', [token], (error, results, fields) => {
//       if (error) {
//         return res.status(401).json({error: "User not logged in"});
//       }
  
//       if (results.length === 0) {
//         return res.status(401).json({error: "User not logged in"});
//       }
  
//       const {id} = results[0];
//       req.user = results[0];
//       next();
//     });
//   };

//   const {authorization} = req.headers;
    
//   if(!authorization){
//       return res.status(401).json({error: "User not logged in"});
//   }
//   const token = authorization.replace("Bearer ", "");
//   jwt.verify(token, JWT_SECRET, (error, payload)=>{
//       if(error){
//           return res.status(401).json({error: "User not logged in"});
//       }
//       const {_id} = payload;
//       UserModel.findById(_id)
//       .then((dbUser)=>{
//           req.user = dbUser;
//           next();                                     //goes to the next middleware or goes to the REST API
//       })
//   });