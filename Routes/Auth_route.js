const express = require('express');
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require('../Config');


router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!password || !username) {
      return res.status(400).send({ error: "One or more mandatory fields are empty" });
    }
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    connection.query(query, (err, result) => {
      if (err) {
        console.error('Error executing the query:', err);
        return res.status(500).send({ error: "Internal Server Error" });
      }
      if (result.length === 0) {
        return res.status(401).send({ error: "This username is not registered with us 🤷‍♂️ " });
      }
      const userInDB = result[0];
      bcryptjs.compare(password, userInDB.password)
        .then((didMatch) => {
          if (didMatch) {
            const jwtToken = jwt.sign({ _id: userInDB._id }, JWT_SECRET);
            const userInfo = { "id": userInDB._id, "username": userInDB.username };
            res.status(200).send({ result: { token: jwtToken, user: userInfo } });
          } else {
            return res.status(401).send({ error: "Oops! Wrong Password 🙃" });
          }
        }).catch((err) => {
          console.log(err);
        })
    });
  });


module.exports = router;





