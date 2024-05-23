const express = require("express");
const router = express.Router();
const protectedRoute = require("../middleware/protectedResourceManager");
const protectedRouteonlytoken = require("../middleware/protectedResource");


const {
  ViewProjectReport,
  ProjectActualStartDate,
} = require("../controllers/projectReport");

router.route("/project/report/:reporting_manager_id").get(protectedRoute,ViewProjectReport);
router
  .route("/project/actualStartDate/:reporting_manager_id")
  .get(protectedRouteonlytoken,ProjectActualStartDate);

module.exports = router;
