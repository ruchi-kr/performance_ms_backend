const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");

// api for employee CRUD

// CREATE

//   });
router.post("/api/admin/addEmployee", (req, res) => {
  const {
    name,
    manager_id,
    designation_id,
    doj,
    dob,
    job_id,
    experience,
    skills,
    mobile_no,
    email,
  } = req.body;

  // Check if email already exists
  const checkQuery =
    "SELECT COUNT(*) as count FROM employee_master WHERE email = ?";
  connection.query(checkQuery, [email], (checkErr, checkResults) => {
    if (checkErr) throw checkErr;

    if (checkResults[0].count > 0) {
      return res
        .status(400)
        .send({ error: "User with this email already registered" });
    } else {
      const insertQuery =
        "INSERT INTO employee_master (name,manager_id, designation_id, doj,dob,job_id, experience, skills, mobile_no, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?)";
      connection.query(
        insertQuery,
        [
          name,
          manager_id,
          designation_id,
          doj,
          dob,
          job_id,
          experience,
          skills,
          mobile_no,
          email,
        ],
        (insertErr, insertResults) => {
          if (insertErr) throw insertErr;
          return res.status(200).send("Employee Added Successfully");
        }
      );
    }
  });
});


// GET
router.get("/api/admin/getEmployees", (req, res) => {
  const { page, pageSize, name = "", email = "" } = req.query;

  // Validate page and pageSize  , email=""
  // Validate page and pageSize  , email=""
  if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
    return res.status(400).send("Invalid page or pageSize");
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  // const query = `SELECT * FROM project_master WHERE project_name LIKE '%${name}%' OR email LIKE '%${email}%' OR designation LIKE '%${designation}%' LIMIT ? OFFSET ?`;
  // const query = 'SELECT * FROM employee_master';
  // const query ='SELECT em.*,rmm.name as reporting_name FROM `employee_master` as em LEFT JOIN reporting_manager_master as rmm On rmm.reporting_manager_id = em.reporting_manager_id';    // JOIN user_master as us ON em.employee_id = us.employee_id
  const query = `SELECT u.*, m.employee_id AS manager_id, m.name AS manager_name, m.mobile_no AS manager_mobile_no, m.email AS manager_email,m.designation_id AS manager_designation_id FROM employee_master u LEFT JOIN employee_master m ON u.manager_id = m.employee_id WHERE u.name LIKE '%${name}%' OR u.email LIKE '%${email}%' LIMIT ? OFFSET ?`;
  // OR u.email LIKE '%${email}%'
  // OR u.email LIKE '%${email}%'
  connection.query(query, [parseInt(pageSize), offset], (err, results) => {
    // if (err) throw err;
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error occurred while processing your request.' });
    } else {
    return res.status(200).json(results);
    }
  });
});

router.get("/api/admin/getEmployeeslist", (req, res) => {
  const query =
    "SELECT u.*, m.employee_id AS manager_id, m.name AS manager_name, m.mobile_no AS manager_mobile_no, m.email AS manager_email,m.designation_id AS manager_designation_id FROM employee_master u LEFT JOIN employee_master m ON u.manager_id = m.employee_id";
  connection.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error occurred while processing your request.' });
    } else {
      return res.status(200).json(results);
    }
        
  });
});

// EDIT
router.post("/api/admin/editEmployee/:employee_id", (req, res) => {
  const employeeId = req.params.employee_id;

  if (!employeeId) {
    return res.status(400).send("Employee ID is required");
  }

  const fetchQuery = "SELECT * FROM employee_master WHERE employee_id = ?";
 
  const updateQuery =
    "UPDATE employee_master SET name=?, manager_id=?, designation_id=?, doj=?, dob=?, job_id=?, experience=?, skills=?, mobile_no=?, email=? WHERE employee_id=?";

  // Fetch project by ID
  connection.query(fetchQuery, [employeeId], (fetchErr, fetchResults) => {
    if (fetchErr) {
      return res.status(500).send("Error fetching employee data");
    }

    if (fetchResults.length === 0) {
      return res.status(404).send("employee not found");
    }

    const existingProject = fetchResults[0];
    const {
      name,
      manager_id,
      designation_id,
      doj,
      dob,
      job_id,
      experience,
      skills,
      mobile_no,
      email,
    } = req.body;

    // Update project data
    connection.query(
      updateQuery,
      [
        name,
        manager_id,
        designation_id,
        doj,
        dob,
        job_id,
        experience,
        skills,
        mobile_no,
        email,
        employeeId,
      ],
      (updateErr, updateResults) => {
        if (updateErr) {
          console.log(updateErr);
          return res.status(500).send("Error updating employee");
        }

        // Fetch updated project data
        connection.query(
          fetchQuery,
          [employeeId],
          (fetchUpdatedErr, fetchUpdatedResults) => {
            if (fetchUpdatedErr) {
              return res
                .status(500)
                .send("Error fetching updated employee data");
            }

            const updatedEmployee = fetchUpdatedResults[0];
            if (updatedEmployee) {
              return res.status(200).json(updatedEmployee); // Return updated project data
            } else {
              return res.status(500).send("Failed to fetch updated employee data"); // Handle case where updated project data is not found
            }
          }
        );
      }
    );
  });
});
// DELETE
router.delete("/api/admin/deleteEmployee/:employee_id", (req, res) => {
  const EmployeeId = req.params.employee_id;
  try {
    const query = "DELETE FROM employee_master WHERE employee_id=?";
    connection.query(query, [EmployeeId], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'An error occurred while processing your request.' });
      } else {
        return res.status(200).send("employee deleted successfully");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// get list of all employee
router.get("/api/admin/getEmployeesList", (req, res) => {
  const query = "SELECT * FROM employee_master ";

  connection.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error occurred while processing your request.' });
    } else {
      return res.status(200).json(results);
    }
  });
});

// for creating credentials employee list
router.get("/api/admin/EmployeesList", (req, res) => {
  const query = `SELECT em.*
  FROM employee_master em
  LEFT JOIN user_master um ON em.employee_id = um.employee_id
  WHERE um.employee_id IS NULL`;

  connection.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error occurred while processing your request.' });
    } else {
      return res.status(200).json(results);
    }
  });
});

module.exports = router;
