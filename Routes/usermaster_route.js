const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const connection = require("../db");

// API FOR USER CRUD

// CREATE
// router.post('/api/admin/addUser', (req, res) => {
//     const { username, status, user_type, password,employee_id} = req.body;
//     const query = 'INSERT INTO user_master ( username, status, user_type, password,employee_id) VALUES (?, ?, ?, ?, ?)';
//     connection.query(query, [username, status, user_type, password,employee_id], (err, results) => {
//       if (err) throw err;
//       res.status(200).send('User Added Successfully');
//     });
//   });

// adding user using bcrypt

router.post("/api/admin/addUser", async (req, res) => {
  const { username, role, status, user_type, password, employee_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const selectQuery = "SELECT * FROM user_master WHERE username = ?";
    connection.query(selectQuery, [username], (err, results) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else if (results.length > 0) {
        return res.status(400).json({ error: "username already exists." });
      } else {
        const Insertquery =
          "INSERT INTO user_master (username,role, status, user_type, password, hashed_password, employee_id) VALUES (?, ?, ?, ?, ?, ?,?)";
        const values = [
          username,
          role,
          status,
          user_type,
          password,
          hashedPassword,
          employee_id,
        ];

        connection.query(Insertquery, values, (err, results) => {
          if (err) {
            console.log(err);
            res.status(500).json({
              error: "An error occurred while processing your request.",
            });
          } else {
            res.status(200).send("User Added Successfully");
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding user");
  }
});

// GET
// with pagination
router.get("/api/admin/getUsers", (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "designation_name",
    sortOrder = "ASC",
    name = "",
    email = "",
    role = "",
  } = req.query;

  const offset = Number((page - 1) * pageSize);

  const query = `SELECT um.*,em.name as employee_name FROM user_master as um LEFT JOIN employee_master as em On em.employee_id = um.employee_id WHERE um.username LIKE '%${name}%' OR um.email_id LIKE '%${email}%'  OR um.role LIKE '%${role}%' ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  connection.query(query, [parseInt(pageSize), offset], (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      users = results;
      connection.query(
        `SELECT COUNT(*) AS total FROM user_master WHERE username LIKE '%${name}%'`,
        [`${name}`],
        (err, results) => {
          if (err) console.log(err);

          results = JSON.parse(JSON.stringify(results));
          totalCount = Number(results[0].total);
          totalPages = Math.ceil(totalCount / pageSize);

          res.status(200).json({
            data: users,
            pagination: {
              totalRecords: totalCount,
              pageSize: Number(pageSize),
              totalPages,
              currentPage: Number(page),
              nextPage: Number(page) < totalPages ? Number(page) + 1 : null,
              prevPage: Number(page) > 1 ? Number(page) - 1 : null,
            },
          });
        }
      );
    }
  });
});

// EDIT
router.post("/api/admin/editUser/:user_id", (req, res) => {
  const UserId = req.params.user_id;

  if (!UserId) {
    return res.status(400).send("User ID is required");
  }

  const fetchQuery = "SELECT * FROM user_master WHERE user_id=?";
  const updateQuery =
    "UPDATE user_master SET username=?,email_id=?,role=?, status =?, user_type=?, password=? WHERE user_id=?";

  // Fetch project by ID
  connection.query(fetchQuery, [UserId], (fetchErr, fetchResults) => {
    if (fetchErr) {
      return res.status(500).send("Error fetching user data");
    }

    if (fetchResults.length === 0) {
      return res.status(404).send("User not found");
    }

    const existingUser = fetchResults[0];
    const { username, email_id, role, status, user_type, password } = req.body;

    // Update project data
    connection.query(
      updateQuery,
      [username, email_id, role, status, user_type, password, UserId],
      (updateErr, updateResults) => {
        if (updateErr) {
          return res.status(500).send("Error updating user");
        }

        // Fetch updated project data
        connection.query(
          fetchQuery,
          [UserId],
          (fetchUpdatedErr, fetchUpdatedResults) => {
            if (fetchUpdatedErr) {
              return res.status(500).send("Error fetching updated user data");
            }

            const updatedUser = fetchUpdatedResults[0];
            if (updatedUser) {
              res.status(200).json(updatedUser); // Return updated project data
            } else {
              res.status(500).send("Failed to fetch updated user data"); // Handle case where updated project data is not found
            }
          }
        );
      }
    );
  });
});

// DELETE
router.delete("/api/admin/deleteUser/:user_id", (req, res) => {
  const UserId = req.params.user_id;
  const query = "DELETE FROM user_master WHERE user_id=?";
  connection.query(query, [UserId], (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      res.status(200).send(" User deleted successfully");
    }
  });
});

module.exports = router;
