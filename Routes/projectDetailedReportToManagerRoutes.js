const express = require("express");
const router = express.Router();

const protectedRoute = require("../middleware/protectedResourceManager");

const {
  ViewProjectReport,
  ViewParticularProjectReport,
} = require("../controllers/projectDetailedReportToManagerController");

router
  .route("/project/report/detailed/:reporting_manager_id")
  .get(protectedRoute, ViewProjectReport);
router
  .route("/project/report/detailed/:reporting_manager_id/:project_id")
  .get(protectedRoute, ViewParticularProjectReport);

module.exports = router;
