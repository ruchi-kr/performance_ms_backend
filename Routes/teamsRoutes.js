const express = require("express");
const router = express.Router();

const {
  GetAllTeams,
  GetTeam,
  AddTeam,
  EditTeam,
  DeleteTeam,
} = require("../controllers/teamsController");

router
  .route("/project/teams/:reporting_manager_id")
  .get(GetAllTeams)
  .post(AddTeam);
router
  .route("/project/teams/:team_id")
  .get(GetTeam)
  .patch(EditTeam)
  .delete(DeleteTeam);

module.exports = router;
