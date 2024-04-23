const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require('../Config');
const connection =require("../db");


// Login route
router.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!password || !username) {
        return res.status(400).send({ error: "One or more mandatory fields are empty" });
    }

    // Find user by username
    connection.query('SELECT * FROM user_master WHERE username = ?', [username], (error, results) => {
        if (error) {
            console.error('Error finding user:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(401).send({ error: "This username is not registered with us 🤷‍♂️" });
        }

        const user = results[0];

        // Compare passwords
        bcryptjs.compare(password, user.hashed_password)
            .then((didMatch) => {
                if (didMatch) {

                    const jwtToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1d' });

                    const userInfo = { "id": user.user_id,"employee_id": user.employee_id, "role": user.role, "username": user.username, "user_type": user.user_type, "email_id": user.email_id, "mobile_no": user.mobile_no };
                    res.status(200).send({ result: { token: jwtToken, user: userInfo } });
                    console.log('Passwords do match 🤷‍♂️');
                } else {
                    return res.status(401).send({ error: "Oops! Wrong Password 🙃" });
                }
            }).catch((err) => {
                console.error('Error comparing passwords:', err);
                return res.status(500).send({ error: "Internal Server Error" });
            })
    });
});

// router.post('/api/forgotPassword', (req, res) => {

//     const { email } = req.body;
//     if (!email) {
//         return res.status(400).send({ error: "Email is required" })
//     }
// })
router.post('/api/forgotPassword', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send({ error: "Email is required" });
    }

    // Check if the user exists in the database
    connection.query('SELECT * FROM user_master WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send({ error: "User not found" });
        }

        // Generate a random password reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Save the token to the user's document
        const updateQuery = 'UPDATE user_master SET resetToken = ?, resetTokenExpiration = ? WHERE email = ?';
        const updateValues = [resetToken, Date.now() + 3600000, username];
        connection.query(updateQuery, updateValues, (err) => {
            if (err) {
                return res.status(500).send({ error: "Error saving token to database" });
            }

            // Send the token to the user's email address
            const mailOptions = {
                to: results[0].email,
                from: "your-email@example.com",
                subject: "Password Reset Request",
                text: `You have requested to reset your password. Please use the following token: ${resetToken}`
            };

            // ... rest of the code to send the email
        });
    });
});

router.post('/api/forgotPasswordVerify', (req, res) => {
    const { email, password, password_confirm, otp } = req.body;
})

module.exports = router;
