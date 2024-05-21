const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../Config");
const connection = require("../db");
const nodemailer = require("nodemailer");

// Login route
router.post("/api/login", (req, res) => {
  const { email_id, password } = req.body;
  if (!password || !email_id) {
    return res
      .status(400)
      .send({ error: "One or more mandatory fields are empty" });
  }

  // Find user by username
  connection.query(
    "SELECT * FROM user_master WHERE email_id = ?",
    [email_id],
    (error, results) => {
      if (error) {
        console.error("Error finding user:", error);
        return res.status(500).send({ error: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .send({ error: "This email is not registered with us 🤷‍♂️" });
      }

      const user = results[0];
      const user_id = JSON.parse(JSON.stringify(user)).user_id;
      // Compare passwords
      bcryptjs
        .compare(password, user.hashed_password)
        .then((didMatch) => {
          if (didMatch) {
            const jwtToken = jwt.sign({ email_id: user.email_id }, JWT_SECRET, {
              expiresIn: "1d",
            });
            var employeeDetails = {};

            const query =
              "SELECT * FROM user_master AS um LEFT JOIN employee_master AS em ON um.employee_id = em.employee_id WHERE um.user_id=?";

            connection.query(query, [user_id], (err, results) => {
              if (err) {
                return res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ msg: "Internal server error" });
              } else {
                const temp = results[0];
                console.log("\nresults", temp.employee_id);
                employeeDetails.employee_id = temp.employee_id
              }
            });

            const userInfo = {
              id: user.user_id,
              employee_id: user.employee_id,
              role: user.role,
              username: user.username,
              user_type: user.user_type,
              email_id: user.email_id,
              mobile_no: user.mobile_no,
              status: user.status,
            };

            res.status(200).send({
              result: {
                token: jwtToken,
                user: userInfo,
                employeeDetails: JSON.parse(JSON.stringify(employeeDetails)),
              },
            });

            // const userInfo = { "id": user.user_id,"employee_id": user.employee_id, "role": user.role, "username": user.username, "user_type": user.user_type, "email_id": user.email_id, "mobile_no": user.mobile_no };
            // res.status(200).send({ result: { token: jwtToken, user: userInfo } });
            console.log("Passwords do match 🤷‍♂️");
          } else {
            return res.status(401).send({ error: "Oops! Wrong Password 🙃" });
          }
        })
        .catch((err) => {
          console.error("Error comparing passwords:", err);
          return res.status(500).send({ error: "Internal Server Error" });
        });
    }
  );
});


router.post("/api/forgotPassword", (req, res) => {
  const { email_id } = req.body;
  if (!email_id) {
    return res.status(400).send({ error: "Email is required" });
  }

  // Check if the user exists in the database
  connection.query(
    "SELECT * FROM user_master WHERE email_id = ?",
    [email_id],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).send({ error: "User not found" });
      }

      // // Generate a random otp
      var otp = Math.floor(1000 + Math.random() * 9000);
      console.log(otp);

      // Send the token to the user's email address
      const mailOptions = {
        to: results[0].email_id,
        from: "ruchi.kumari63@gmail.com",
        subject: "Reset Your Password",
        text: `You have requested to reset your password. Please use the following otp: ${otp}`,
      };

      // ... rest of the code to send the email
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ruchi.kumari63@gmail.com',
          pass: 'ofer dhwe evrz enzk'
        }
      });
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.send({ Status: "Email sent" })
        }
      });

    });
}
);


router.post("/api/forgotPasswordVerify", (req, res) => {
  const { email_id, password, password_confirm, otp } = req.body;

  if (!email_id || !password || !password_confirm || !otp) {
    return res.status(400).send({ error: "Missing required fields" });
  }

  if (password !== password_confirm) {
    return res.status(400).send({ error: "Passwords do not match" });
  }

  // Check if the user exists in the database
  connection.query(
    "SELECT * FROM user_master WHERE email_id = ? AND otp = ?",
    [email_id, otp],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).send({ error: "Invalid email or OTP" });
      }

      // Hash the new password
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) throw hashErr;

        // Update the user's password in the database
        const updateQuery = "UPDATE user_master SET password = ? WHERE email_id = ?";
        connection.query(updateQuery, [hashedPassword, email_id], (updateErr) => {
          if (updateErr) throw updateErr;
          res.status(200).send({ message: "Password reset successful" });
        });
      });
    }
  );
});

module.exports = router;
