const express = require('express');
const router = express.Router();
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



// API FOR USER CRUD
// CREATE
router.post('/api/admin/addUser', (req, res) => {
    const { username, status, user_type, password,employee_id} = req.body;
    const query = 'INSERT INTO user_master ( username, status, user_type, password,employee_id) VALUES (?, ?, ?, ?,?)';
    // console.log(query);
    connection.query(query, [username, status, user_type, password,employee_id], (err, results) => {
      if (err) throw err;
      res.status(200).send('User Added Successfully');
    });
  });
  // GET
  router.get('/api/admin/getUsers', (req, res) => {
    // const query = 'SELECT * FROM user_master';
    const query ='SELECT um.*,em.name as employee_name FROM `user_master` as um RIGHT JOIN employee_master as em On em.employee_id = um.employee_id';
    // console.log(query);
    connection.query(query, (err, results) => {
      if (err) throw err;
      console.log(results);
      res.status(200).json(results);
    });
  });
  // EDIT
  router.post('/api/admin/editUser/:user_id', (req, res) => {
    const UserId = req.params.user_id; 
    
    if (!UserId) {
      return res.status(400).send('User ID is required');
    }
  
    const fetchQuery = 'SELECT * FROM user_master WHERE user_id=?';
    const updateQuery = 'UPDATE user_master SET username=?, status =?, user_type=?, password=? WHERE user_id=?';
  
    // Fetch project by ID
    connection.query(fetchQuery, [UserId], (fetchErr, fetchResults) => {
      if (fetchErr) {
        return res.status(500).send('Error fetching user data');
      }
  
      if (fetchResults.length === 0) {
        return res.status(404).send('User not found');
      }
  
      const existingUser = fetchResults[0];
      const { username, status, user_type, password} = req.body;
  
      // Update project data
      connection.query(updateQuery, [username, status, user_type, password, UserId], (updateErr, updateResults) => {
        if (updateErr) {
          return res.status(500).send('Error updating user');
        }
  
        // Fetch updated project data
        connection.query(fetchQuery, [UserId], (fetchUpdatedErr, fetchUpdatedResults) => {
          if (fetchUpdatedErr) {
            return res.status(500).send('Error fetching updated user data');
          }
  
          const updatedUser = fetchUpdatedResults[0];
          if (updatedUser) {
              res.status(200).json(updatedUser); // Return updated project data
          } else {
              res.status(500).send('Failed to fetch updated user data'); // Handle case where updated project data is not found
          }
        });
      });
    });
  });
  // DELETE
  router.delete('/api/admin/deleteUser/:user_id', (req, res) => {
    const UserId = req.params.user_id;
    const query = 'DELETE FROM user_master WHERE user_id=?';
    connection.query(query, [UserId], (err, results) => {
      if (err) throw err;
      res.status(200).send(' User deleted successfully');
    });
  });


  module.exports=router;