const express = require("express");
const router = express.Router();

const {
  GetProjectPlan,
  AddProjectPlan,
  EditProjectPlan,
  GetLatestProjectPlan,
} = require("../controllers/projectPlanController");

router.route("/project/plan/:employee_id").get(GetProjectPlan);
router.route("/project/latestplan").get(GetLatestProjectPlan);
router.route("/project/plan/").post(AddProjectPlan);
router.route("/project/plan/:plan_id").patch(EditProjectPlan);

module.exports = router;
