const express = require("express");
const router = express.Router();

const protectedRoute = require("../middleware/protectedResourceManager");

const {
  ViewProjectReport,
  ViewParticularEmployeeReportProjectWise,
} = require("../controllers/employeeReportToManager");

router.route("/employee/report/:reporting_manager_id").get(protectedRoute,ViewProjectReport);
router
  .route("/employee/report/:reporting_manager_id/:employee_id")
  .get(protectedRoute,ViewParticularEmployeeReportProjectWise);
// router
//   .route("/project/actualStartDate/:reporting_manager_id")
//   .get(ProjectActualStartDate);

module.exports = router;
