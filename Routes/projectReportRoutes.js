const express = require("express");
const router = express.Router();

const { ViewProjectReport } = require("../controllers/projectReport");

router.route("/project/report/:reporting_manager_id").get(ViewProjectReport);

module.exports = router;
