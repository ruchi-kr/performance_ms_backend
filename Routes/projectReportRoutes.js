const express = require("express");
const router = express.Router();

const {
  ViewProjectReport,
  ProjectActualStartDate,
} = require("../controllers/projectReport");

router.route("/project/report/:reporting_manager_id").get(ViewProjectReport);
router
  .route("/project/actualStartDate/:reporting_manager_id")
  .get(ProjectActualStartDate);

module.exports = router;
