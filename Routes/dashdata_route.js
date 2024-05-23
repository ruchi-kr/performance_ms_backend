const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");
const asyncConnection = require("../db2");
const { StatusCodes } = require("http-status-codes");
const protectedRoute = require("../middleware/protectedResourceAdmin");

// no.of projects
router.get("/api/getDashData",protectedRoute, (req, res) => {
  const query=`SELECT 
  (SELECT COUNT(*) FROM project_master) AS projectCount,
  (SELECT COUNT(*) FROM employee_master WHERE manager_id IS NULL) AS managerCount,
  (SELECT COUNT(*) FROM  employee_master WHERE manager_id IS NOT NULL) AS teamMemberCount`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching project count:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    const projectCount = results[0].projectCount;
    res.status(200).json(results);
  });
});



module.exports = router;
