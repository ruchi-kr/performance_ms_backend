const express = require("express");
const router = express.Router();
const protectedRoute = require("../middleware/protectedResourceManager");

const {
  GetAllTeams,
  GetTeam,
  AddTeam,
  EditTeam,
  DeleteTeam,
} = require("../controllers/teamsController");

router
  .route("/project/teams/:reporting_manager_id")
  .get(protectedRoute,GetAllTeams)
  .post(protectedRoute,AddTeam);
router
  .route("/project/teams/:team_id")
  .get(protectedRoute,GetTeam)
  .patch(protectedRoute,EditTeam)
  .delete(protectedRoute,DeleteTeam);

module.exports = router;
