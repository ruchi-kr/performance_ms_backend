const express = require("express");
const router = express.Router();

const { ViewProjectReport } = require("../controllers/employeeReportToManager");

router.route("/employee/report/:reporting_manager_id").get(ViewProjectReport);
// router
//   .route("/project/actualStartDate/:reporting_manager_id")
//   .get(ProjectActualStartDate);

module.exports = router;
