const express = require("express");
const router = express.Router();

const { ViewProjectReport } = require("../controllers/projectDetailedReportToManagerController");

router
  .route("/project/report/detailed/:reporting_manager_id")
  .get(ViewProjectReport);

module.exports = router;
