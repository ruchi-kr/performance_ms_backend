const express = require("express");
const router = express.Router();

const protectedRoute = require("../middleware/protectedResourceAdmin");
const protectedRouteonlytoken = require("../middleware/protectedResource");


const {
  AddSystemSettings,
  GetSystemSettings,
  EditSystemSettings,
} = require("../controllers/systemSettings");

router.route("/admin/systemsettings").get(protectedRouteonlytoken,GetSystemSettings).post(protectedRoute,AddSystemSettings);
router
  .route("/admin/editsystemsettings/:settings_id")
  .patch(protectedRoute,EditSystemSettings);

module.exports = router;
