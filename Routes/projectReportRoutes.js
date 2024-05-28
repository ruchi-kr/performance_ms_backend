const express = require("express");
const router = express.Router();
const protectedRoute = require("../middleware/protectedResourceManager");
const protectedRouteonlytoken = require("../middleware/protectedResource");


const {
  ViewProjectReport,
  ProjectActualStartDate,
  ProjectActualEndDate
} = require("../controllers/projectReport");

router.route("/project/report/:reporting_manager_id").get(protectedRoute,ViewProjectReport);
router
  .route("/project/actualStartDate/:reporting_manager_id")
  .get(protectedRouteonlytoken,ProjectActualStartDate);
router
  .route("/project/actualEndDate/:reporting_manager_id")
  .get(protectedRouteonlytoken,ProjectActualEndDate);

module.exports = router;
