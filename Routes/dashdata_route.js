const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const protectedRoute = require("../middleware/protectedResource");
const connection = require("../db");
const asyncConnection = require("../db2");
const { StatusCodes } = require("http-status-codes");

// no.of projects
router.get("/api/getDashData", (req, res) => {
  const query = "SELECT COUNT(*) AS projectCount FROM project_master";
  // const query2 = 'SELECT COUNT(*) AS employeeCount FROM employee_master';
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching project count:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    const projectCount = results[0].projectCount;
    res.status(200).json({ projectCount });
  });
});

// router.get("/api/getDashData", (req, res) => {
//   const queries = [
//     "SELECT COUNT(*) AS projectCount FROM project_master",
//     "SELECT COUNT(*) AS employeeCount FROM employee_master",
//     "SELECT COUNT(*) AS userCount FROM user_master",
//     "SELECT COUNT(*) AS reportingManagerCount FROM reporting_manager_master",
//   ];

//   connection.query(queries, (error, results) => {
//     if (error) {
//       console.error("Error fetching data:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }

//     const [
//       projectCountResult,
//       employeeCountResult,
//       userCountResult,
//       reportingManagerCountResult,
//     ] = results;

//     const projectCount = projectCountResult[0].projectCount;
//     const employeeCount = employeeCountResult[0].employeeCount;
//     const userCount = userCountResult[0].userCount;
//     const reportingManagerCount =
//       reportingManagerCountResult[0].reportingManagerCount;

//     res
//       .status(200)
//       .json({ projectCount, employeeCount, userCount, reportingManagerCount });
//   });
// });

module.exports = router;
