const express = require("express");
const router = express.Router();

const {
  GetProjectTotalManHours,
} = require("../controllers/getProjectTotalManHours");
router.route("/getProjectTotalManHours").get(GetProjectTotalManHours);
module.exports = router;
