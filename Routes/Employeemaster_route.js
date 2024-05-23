const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");
const protectedRoute = require("../middleware/protectedResourceAdmin");
const protectedRouteonlytoken = require("../middleware/protectedResource");
// api for employee CRUD

// CREATE

router.post("/api/admin/addEmployee",protectedRoute, (req, res) => {
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
router.get("/api/admin/getEmployees",protectedRoute, (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    name = "",
    email = "",
    sortBy = "name",
    sortOrder = "ASC",
  } = req.query;

  const offset = Number((page - 1) * pageSize);
  const query = `
  SELECT 
    u.*, 
    m.employee_id AS manager_id, 
    m.name AS manager_name, 
    m.mobile_no AS manager_mobile_no, 
    m.email AS manager_email, 
    m.designation_id AS manager_designation_id, 
    j.job_role_name, 
    d.designation_name AS designation_name
  FROM employee_master u 
  LEFT JOIN employee_master m ON u.manager_id = m.employee_id 
  LEFT JOIN job_role_master j ON u.job_id = j.job_id
  LEFT JOIN designation_master d ON u.designation_id = d.designation_id
  WHERE u.name LIKE '%${name}%' OR u.email LIKE '%${email}%'
  ORDER BY ${sortBy} ${sortOrder} 
  LIMIT ? OFFSET ?`;
  // const query = `SELECT u.*, m.employee_id AS manager_id, m.name AS manager_name, m.mobile_no AS manager_mobile_no, m.email AS manager_email,m.designation_id AS manager_designation_id FROM employee_master u LEFT JOIN employee_master m ON u.manager_id = m.employee_id WHERE u.name LIKE '%${name}%' OR u.email LIKE '%${email}%' ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  connection.query(query, [Number(pageSize), offset], (err, results) => {
    // if (err) throw err;
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      employees = results;
      connection.query(
        `SELECT COUNT(*) AS total 
 FROM employee_master AS em 
 WHERE em.name LIKE ?;`,
        [`%${name}%`],
        (err, results) => {
          if (err) console.log(err);

          results = JSON.parse(JSON.stringify(results));
          totalCount = Number(results[0].total);
          totalPages = Math.ceil(totalCount / pageSize);

          res.status(200).json({
            data: employees,
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

router.get("/api/admin/getEmployeeslist",protectedRouteonlytoken, (req, res) => {
  const query =
    "SELECT u.*,jrm.*, m.employee_id AS manager_id, m.name AS manager_name, m.mobile_no AS manager_mobile_no, m.email AS manager_email,m.designation_id AS manager_designation_id FROM employee_master u LEFT JOIN employee_master AS m ON u.manager_id = m.employee_id LEFT JOIN job_role_master AS jrm ON u .job_id = jrm.job_id";
  connection.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      return res.status(200).json(results);
    }
  });
});

// EDIT
router.post("/api/admin/editEmployee/:employee_id",protectedRoute, (req, res) => {
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
              return res
                .status(500)
                .send("Failed to fetch updated employee data"); // Handle case where updated project data is not found
            }
          }
        );
      }
    );
  });
});
// DELETE
router.delete("/api/admin/deleteEmployee/:employee_id",protectedRoute, (req, res) => {
  const EmployeeId = req.params.employee_id;
  try {
    const query = "DELETE FROM employee_master WHERE employee_id=?";
    connection.query(query, [EmployeeId], (err, results) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        return res.status(200).send("employee deleted successfully");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// get list of all employee
router.get("/api/admin/getEmployeesList",protectedRouteonlytoken, (req, res) => {
  const query = "SELECT * FROM employee_master ";

  connection.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      return res.status(200).json(results);
    }
  });
});

// for creating credentials employee list
router.get("/api/admin/EmployeesList",protectedRoute, (req, res) => {
  const query = `SELECT em.*
  FROM employee_master em
  LEFT JOIN user_master um ON em.employee_id = um.employee_id
  WHERE um.employee_id IS NULL`;

  connection.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      return res.status(200).json(results);
    }
  });
});

module.exports = router;
