const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const protectedRoute = require("../middleware/protectedResource");
const connection = require("../db");

// API FOR PROJECT CRUD

// CREATE project
router.post("/api/admin/addProject", protectedRoute, (req, res) => {
  const { project_name, schedule_start_date, schedule_end_date } = req.body;
  const query =
    "INSERT INTO project_master ( project_name, schedule_start_date,schedule_end_date) VALUES (?, ?, ?)";
  connection.query(
    query,
    [project_name, schedule_start_date, schedule_end_date],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
      } else {
        res.status(200).send("Project Added Successfully");
      } 
    }
  );
});

// // Get project
// router.get('/api/admin/getProjects', (req, res) => {

//     const query = 'SELECT * FROM project_master';
//     connection.query(query,(err, results) => {
//       if (err) throw err;
//       res.status(200).json(results);
//     });
//   });

// Get project
// with pagination
router.get("/api/admin/getallProject", (req, res) => {
  const { page, pageSize, name = "" } = req.query;

  // Validate page and pageSize
  if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
    return res.status(400).send("Invalid page or pageSize");
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const query = `SELECT * FROM project_master WHERE project_name LIKE '%${name}%' LIMIT ? OFFSET ?`;
  connection.query(query, [parseInt(pageSize), offset], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    } else {
      res.status(200).json(results);
    }
    
  });
});
// without pagination
router.get("/api/admin/getProjects", (req, res) => {
  // const query = 'SELECT * FROM project_master ';
  try {
    const query =
      "SELECT pm.*,t.team_id,t.employee_id,t.reporting_manager_id,em.name FROM project_master AS pm LEFT JOIN team AS t ON pm.project_id=t.project_id LEFT JOIN employee_master AS em ON t.reporting_manager_id=em.employee_id";
    connection.query(query, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// Edit project
router.post(
  "/api/admin/editProject/:project_id",
  protectedRoute,
  (req, res) => {
    const projectId = req.params.project_id;

    if (!projectId) {
      return res.status(400).send("Project ID is required");
    }

    const fetchQuery = "SELECT * FROM project_master WHERE project_id=?";
    const updateQuery =
      "UPDATE project_master SET project_name=?, schedule_start_date =?, schedule_end_date=? WHERE 	project_id=?";

    // Fetch project by ID
    connection.query(fetchQuery, [projectId], (fetchErr, fetchResults) => {
      if (fetchErr) {
        return res.status(500).send("Error fetching project data");
      }

      if (fetchResults.length === 0) {
        return res.status(404).send("Project not found");
      }

      const existingProject = fetchResults[0];
      const { project_name, schedule_start_date, schedule_end_date } = req.body;

      // Update project data
      connection.query(
        updateQuery,
        [project_name, schedule_start_date, schedule_end_date, projectId],
        (updateErr, updateResults) => {
          if (updateErr) {
            return res.status(500).send("Error updating project");
          }

          // Fetch updated project data
          connection.query(
            fetchQuery,
            [projectId],
            (fetchUpdatedErr, fetchUpdatedResults) => {
              if (fetchUpdatedErr) {
                return res
                  .status(500)
                  .send("Error fetching updated project data");
              }

              const updatedProject = fetchUpdatedResults[0];
              if (updatedProject) {
                res.status(200).json(updatedProject); // Return updated project data
              } else {
                res.status(500).send("Failed to fetch updated project data"); // Handle case where updated project data is not found
              }
            }
          );
        }
      );
    });
  }
);

// DELETE project
router.delete(
  "/api/admin/deleteProject/:project_id",
  protectedRoute,
  (req, res) => {
    const ProjectId = req.params.project_id;
    const query = "DELETE FROM project_master WHERE project_id=?";
    connection.query(query, [ProjectId], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
      } else {
        res.status(200).send("Project deleted successfully");
      }     
    });
  }
);

// no.of projects
// router.get('/api/getDashData', (req, res) => {
//   connection.query('SELECT COUNT(*) AS projectCount FROM project_master', (error, results) => {
//     if (error) {
//       console.error('Error fetching project count:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }
//     const projectCount = results[0].projectCount;
//     res.status(200).json({ projectCount });
//   });
// });

router.get("/api/getDashData", (req, res) => {
  const queries = [
    "SELECT COUNT(*) AS projectCount FROM project_master",
    "SELECT COUNT(*) AS employeeCount FROM employee_master",
    "SELECT COUNT(*) AS userCount FROM user_master",
    "SELECT COUNT(*) AS reportingManagerCount FROM reporting_manager_master",
  ];

  connection.query(queries, (error, results) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const [
      projectCountResult,
      employeeCountResult,
      userCountResult,
      reportingManagerCountResult,
    ] = results;

    const projectCount = projectCountResult[0].projectCount;
    const employeeCount = employeeCountResult[0].employeeCount;
    const userCount = userCountResult[0].userCount;
    const reportingManagerCount =
      reportingManagerCountResult[0].reportingManagerCount;

    res
      .status(200)
      .json({ projectCount, employeeCount, userCount, reportingManagerCount });
  });
});

// to export to excel and pdf file
router.get("/api/admin/getexcelpdfprojects", (req, res) => { 
  try {
    const query = 'SELECT * FROM project_master';
    connection.query(query, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
      } else {
        res.status(200).json(results);
      }
    
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
