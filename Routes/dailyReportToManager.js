const express = require("express");
const router = express.Router();

const {
  GetDailyReportToManagerPerEmployee,
} = require("../controllers/reportingManagerController");

router
  .route("/project/employee/report/:manager_id/:employee_id/:project_id")
  .get(GetDailyReportToManagerPerEmployee);

module.exports = router;
