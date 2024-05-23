const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");
const protectedRoute = require("../middleware/protectedResourceAdmin");
const protectRouteonlytoken = require("../middleware/protectedResource");
// API FOR Designation CRUD

// CREATE designation
router.post("/api/admin/addDesignation", protectedRoute, (req, res) => {
  const { designation_name } = req.body;
  const selectQuery = "SELECT * FROM designation_master WHERE designation_name = ?";
  connection.query(selectQuery, [designation_name], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else if (results.length > 0) {
      return res.status(400).json({ error: "designation name already exists." });
    } else {
  const query = "INSERT INTO designation_master ( designation_name) VALUES (?)";
  connection.query(query, [designation_name], (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      res.status(200).send("designation Added Successfully");
    }
  });
}});
});

// Get designation
router.get("/api/admin/getAllDesignation", protectedRoute, (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    name = "",
    sortBy = "designation_name",
    sortOrder = "ASC",
  } = req.query;

  const offset = Number((page - 1) * pageSize);

  const query = `SELECT * FROM designation_master WHERE designation_name LIKE '%${name}%' ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;

  connection.query(query, [Number(pageSize), offset], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      designation = results;
      connection.query(
        `SELECT COUNT(*) OVER() AS total FROM designation_master WHERE designation_name LIKE '%${name}%';`,
        [`${name}`],
        (err, results) => {
          if (err) console.log(err);

          results = JSON.parse(JSON.stringify(results));
          totalCount = Number(results[0].total);
          totalPages = Math.ceil(totalCount / pageSize);

          res.status(200).json({
            data: designation,
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

// Edit designation
router.post("/api/admin/editDesignation/:designation_id",protectedRoute, (req, res) => {
  const DesignationId = req.params.designation_id;

  if (!DesignationId) {
    return res.status(400).send("Designation Id is required");
  }
  const selectQuery = "SELECT * FROM designation_master WHERE designation_name = ?";
  const fetchQuery = "SELECT * FROM designation_master WHERE designation_id=?";
  const updateQuery =
    "UPDATE designation_master SET designation_name=? WHERE designation_id=?";

   
  // Fetch designation by ID
  connection.query(fetchQuery, [DesignationId], (fetchErr, fetchResults) => {
    if (fetchErr) {
      return res.status(500).send("Error fetching designation data");
    }

    if (fetchResults.length === 0) {
      return res.status(404).send("designation not found");
    }
    const existingManager = fetchResults[0];
    const { designation_name } = req.body;
    connection.query(selectQuery, [designation_name], (selectErr, selectResults) => {
      if (selectErr) {
        return res.status(500).send("Error checking designation existence");
      }
  
      if (selectResults.length > 0) {
        return res.status(400).json({ error: "Designation name already exists." });
      }
   

    // Update designation data
    connection.query(
      updateQuery,
      [designation_name, DesignationId],
      (updateErr, updateResults) => {
        if (updateErr) {
          return res.status(500).send("Error updating designation");
        }

        // Fetch updated designation data
        connection.query(
          fetchQuery,
          [DesignationId],
          (fetchUpdatedErr, fetchUpdatedResults) => {
            if (fetchUpdatedErr) {
              return res
                .status(500)
                .send("Error fetching updated designation data");
            }

            const updatedDesignation = fetchUpdatedResults[0];
            if (updatedDesignation) {
              res.status(200).json(updatedDesignation); // Return updated project data
            } else {
              res.status(500).send("Failed to fetch updated designation data"); // Handle case where updated project data is not found
            }
          }
        );
      }
    );
  });
  });
});

// delete designation
router.delete("/api/admin/deleteDesignation/:designation_id",protectedRoute, (req, res) => {
  const DesignationId = req.params.designation_id;

  // Check if the designation is assigned to any employee
  const checkQuery =
    "SELECT COUNT(*) as count FROM employee_master WHERE designation_id = ?";
  connection.query(checkQuery, [DesignationId], (checkErr, checkResults) => {
    if (checkErr) throw checkErr;

    if (checkResults[0].count > 0) {
      res.status(400).send({
        error: "designation cannot be deleted as it is assigned to an employee",
      });
    } else {
      const deleteQuery =
        "DELETE FROM designation_master WHERE designation_id = ?";
      connection.query(
        deleteQuery,
        [DesignationId],
        (deleteErr, deleteResults) => {
          if (deleteErr) throw deleteErr;
          res.status(200).send({msg:"designation deleted successfully"});
        }
      );
    }
  });
});

// get list of all designation
router.get("/api/admin/getDesignationList", protectRouteonlytoken, (req, res) => {
  const query = "SELECT * FROM designation_master";
  // const query ='SELECT rmm.*,em.name as manager_name FROM `reporting_manager_master` as rmm LEFT JOIN employee_master as em On rmm.employee_id = em.employee_id';    // JOIN user_master as us ON em.employee_id = us.employee_id

  connection.query(query, (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      res.status(200).send(results);
    }
  });
});

module.exports = router;
