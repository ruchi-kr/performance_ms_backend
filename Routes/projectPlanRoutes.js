const express = require("express");
const router = express.Router();

const protectedRouteonlytoken = require("../middleware/protectedResource");
const protectedRoute = require("../middleware/protectedResourceM+A");


const {
  GetProjectPlan,  //ALL
  AddProjectPlan,  // M && A
  EditProjectPlan,    //M && A
  GetLatestProjectPlan, // ALL
} = require("../controllers/projectPlanController");

router.route("/project/plan/:project_id").get(protectedRouteonlytoken,GetProjectPlan);
router.route("/project/latestplan/:project_id").get(protectedRouteonlytoken,GetLatestProjectPlan);
router.route("/project/plan/").post(protectedRoute,AddProjectPlan);
router.route("/project/plan/:plan_id").patch(protectedRoute,EditProjectPlan);

module.exports = router;
