const express = require("express");
const router = express.Router();
const protectedRoute = require("../middleware/protectedResourceManager");

const {ModuleDelayCalculator, TasksDelayCalculator } = require("../controllers/projectDelayController");

router.route("/project/delay/module/:project_id").get(protectedRoute,ModuleDelayCalculator);
router.route("/project/delay/task/:module_id").get(protectedRoute,TasksDelayCalculator);

module.exports = router;
