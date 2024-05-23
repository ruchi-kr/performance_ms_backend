const express = require("express");
const router = express.Router();

const protectedRoute = require("../middleware/protectedResourceManager");

const { ViewProjectReport } = require("../controllers/projectDetailedReportToManagerController");

router
  .route("/project/report/detailed/:reporting_manager_id")
  .get(protectedRoute,ViewProjectReport);

module.exports = router;
