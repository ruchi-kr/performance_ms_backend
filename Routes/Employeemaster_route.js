const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const connection =require("../db");


// api for employee CRUD

// CREATE
// router.post('/api/admin/addEmployee', (req, res) => {
//     const {name, designation, doj, experience,skills,mobile_no,email,reporting_manager_id} = req.body;
//     const query = 'INSERT INTO employee_master ( name, designation, doj, experience,skills,mobile_no,email,reporting_manager_id) VALUES (?, ?, ?,?,?,?,?,?)';
//     connection.query(query, [name, designation, doj, experience, skills, mobile_no, email, reporting_manager_id], (err, results) => {
//       if (err) throw err;
//       res.status(200).send('Employee Added Successfully');
//     });
//   });
  router.post('/api/admin/addEmployee', (req, res) => {
    const { name, designation, doj, experience, skills, mobile_no, email, reporting_manager_id } = req.body;
  
    // Check if email already exists
    const checkQuery = 'SELECT COUNT(*) as count FROM employee_master WHERE email = ?';
    connection.query(checkQuery, [email], (checkErr, checkResults) => {
      if (checkErr) throw checkErr;
  
      if (checkResults[0].count > 0) {
        res.status(400).send({ error: "User with this email already registered" });
      } else {
        const insertQuery = 'INSERT INTO employee_master (name, designation, doj, experience, skills, mobile_no, email, reporting_manager_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(insertQuery, [name, designation, doj, experience, skills, mobile_no, email, reporting_manager_id], (insertErr, insertResults) => {
          if (insertErr) throw insertErr;
          res.status(200).send('Employee Added Successfully');
        });
      }
    });
  });
  // GET
  router.get('/api/admin/getEmployees', (req, res) => {
    // const query = 'SELECT * FROM employee_master';
    const query ='SELECT em.*, rmm.name as reporting_name, us.user_id FROM employee_master as em LEFT JOIN reporting_manager_master as rmm On rmm.reporting_manager_id = em.reporting_manager_id JOIN user_master as us ON em.employee_id = us.employee_id';
    connection.query(query, (err, results) => {
      if (err) throw err;
      res.status(200).json(results);
    });
  });


  // EDIT
  router.post('/api/admin/editEmployee/:employee_id', (req, res) => {
    const employeeId = req.params.employee_id; 
    
    if (!employeeId) {
      return res.status(400).send('Employee ID is required');
    }
  
    const fetchQuery = 'SELECT * FROM employee_master WHERE employee_id=?';
    const updateQuery = 'UPDATE employee_master SET name=?, designation=?, doj=?, experience=?,skills=?,mobile_no=?,email=?,reporting_manager_id=? WHERE employee_id=?';
  
    // Fetch project by ID
    connection.query(fetchQuery, [employeeId], (fetchErr, fetchResults) => {
      if (fetchErr) {
        return res.status(500).send('Error fetching employee data');
      }
  
      if (fetchResults.length === 0) {
        return res.status(404).send('employee not found');
      }
  
      const existingProject = fetchResults[0];
      const { name, designation, doj, experience,skills,mobile_no,email,reporting_manager_id} = req.body;
  
      // Update project data
      connection.query(updateQuery, [name, designation, doj, experience,skills,mobile_no,email,reporting_manager_id, employeeId], (updateErr, updateResults) => {
        if (updateErr) {
          return res.status(500).send('Error updating employee');
        }
  
        // Fetch updated project data
        connection.query(fetchQuery, [employeeId], (fetchUpdatedErr, fetchUpdatedResults) => {
          if (fetchUpdatedErr) {
            return res.status(500).send('Error fetching updated employee data');
          }
  
          const updatedEmployee = fetchUpdatedResults[0];
          if (updatedEmployee) {
              res.status(200).json(updatedEmployee); // Return updated project data
          } else {
              res.status(500).send('Failed to fetch updated employee data'); // Handle case where updated project data is not found
          }
        });
      });
    });
  });
  // DELETE
  router.delete('/api/admin/deleteEmployee/:employee_id', (req, res) => {
    const EmployeeId = req.params.employee_id;
    const query = 'DELETE FROM employee_master WHERE employee_id=?';
    connection.query(query, [EmployeeId], (err, results) => {
      if (err) throw err;
      res.send('employee deleted successfully');
    });
  });
  
// get list of all employee
router.get('/api/admin/getEmployeesList', (req, res) => {
  
  const query = 'SELECT * FROM employee_master';

  connection.query(query, (err, results) => {
    if (err) throw err;
    res.status(200).json(results);
  })
})

module.exports = router;