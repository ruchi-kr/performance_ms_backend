const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");
const { StatusCodes } = require("http-status-codes");

// API FOR Job Role CRUD

// CREATE job role
router.post("/api/admin/addJobRole", (req, res) => {
  const { job_role_name } = req.body;
  const selectQuery = "SELECT * FROM job_role_master WHERE job_role_name = ?";
  connection.query(selectQuery, [job_role_name], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else if (results.length > 0) {
      return res.status(400).json({ error: "job role name already exists." });
    } else {
      const insertQuery =
        "INSERT INTO job_role_master (job_role_name) VALUES (?)";
      connection.query(insertQuery, [job_role_name], (err, results) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({
              error: "An error occurred while processing your request.",
            });
        } else {
          return res.status(StatusCodes.OK).send("job role Added Successfully");
        }
      });
    }
  });
});

// Get job role
router.get("/api/admin/getAllJobRole", (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    name = "",
    sortBy = "job_role_name",
    sortOrder = "ASC",
  } = req.query;

  const offset = Number((page - 1) * pageSize);

  const query = `SELECT * FROM job_role_master WHERE job_role_name LIKE '%${name}%' ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;

  connection.query(query, [parseInt(pageSize), offset], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      jobRoleData = results;
      connection.query(
        "SELECT COUNT(*) AS total FROM job_role_master ",
        [`${name}`],
        (err, results) => {
          if (err) console.log(err);

          results = JSON.parse(JSON.stringify(results));
          totalCount = results[0].total;
          totalPages = Math.ceil(totalCount / pageSize);

          res.status(200).json({
            data: jobRoleData,
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

// Edit job role
router.post("/api/admin/editJobRole/:job_id", (req, res) => {
  const JobRoleId = req.params.job_id;

  if (!JobRoleId) {
    return res.status(400).send("Job Id is required");
  }

  const fetchQuery = "SELECT * FROM job_role_master WHERE job_id=?";
  const updateQuery =
    "UPDATE job_role_master SET job_role_name=? WHERE job_id=?";

  // Fetch designation by ID
  connection.query(fetchQuery, [JobRoleId], (fetchErr, fetchResults) => {
    if (fetchErr) {
      return res.status(500).send("Error fetching job role data");
    }

    if (fetchResults.length === 0) {
      return res.status(404).send("job role not found");
    }

    const existingJobRole = fetchResults[0];
    const { job_role_name } = req.body;

    // Update designation data
    connection.query(
      updateQuery,
      [job_role_name, JobRoleId],
      (updateErr, updateResults) => {
        if (updateErr) {
          return res.status(500).send("Error updating job role");
        }

        // Fetch updated designation data
        connection.query(
          fetchQuery,
          [JobRoleId],
          (fetchUpdatedErr, fetchUpdatedResults) => {
            if (fetchUpdatedErr) {
              return res
                .status(500)
                .send("Error fetching updated job role data");
            }

            const updatedJobRole = fetchUpdatedResults[0];
            if (updatedJobRole) {
              return res.status(200).json(updatedJobRole); // Return updated project data
            } else {
              return res
                .status(500)
                .send("Failed to fetch updated job role data"); // Handle case where updated project data is not found
            }
          }
        );
      }
    );
  });
});

// Delete job role

router.delete("/api/admin/deleteJobRole/:job_id", (req, res) => {
  const JobRoleId = req.params.job_id;

  // Check if the job role is assigned to any employee
  const checkQuery =
    "SELECT COUNT(*) as count FROM job_role_master WHERE job_id = ?";
  connection.query(checkQuery, [JobRoleId], (checkErr, checkResults) => {
    if (checkErr) throw checkErr;

    if (checkResults[0].count > 0) {
      return res
        .status(400)
        .send({
          error: "job role cannot be deleted as it is assigned to an employee",
        });
    } else {
      const deleteQuery = "DELETE FROM job_role_master WHERE job_id = ?";
      connection.query(deleteQuery, [JobRoleId], (deleteErr, deleteResults) => {
        if (deleteErr) throw deleteErr;
        return res.send("job role deleted successfully");
      });
    }
  });
});

// get list of all job role
router.get("/api/admin/getJobRoleList", (req, res) => {
  const query = "SELECT * FROM job_role_master";
  // const query ='SELECT rmm.*,em.name as manager_name FROM `reporting_manager_master` as rmm LEFT JOIN employee_master as em On rmm.employee_id = em.employee_id';    // JOIN user_master as us ON em.employee_id = us.employee_id

  connection.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      return res.status(200).send(results);
    }
  });
});

module.exports = router;
