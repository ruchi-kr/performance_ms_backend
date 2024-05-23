const express = require("express");
const router = express.Router();

const protectedRoute = require("../middleware/protectedResourceManager");

const {
  GetDailyReportToManagerPerEmployee,
} = require("../controllers/reportingManagerController");

router
  .route("/project/employee/report/:manager_id/:employee_id/:project_id")
  .get(protectedRoute,GetDailyReportToManagerPerEmployee);

module.exports = router;
