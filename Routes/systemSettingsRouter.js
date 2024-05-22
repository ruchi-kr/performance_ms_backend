const express = require("express");
const router = express.Router();

const {
  AddSystemSettings,
  GetSystemSettings,
  EditSystemSettings,
} = require("../controllers/systemSettings");

router.route("/admin/systemsettings").get(GetSystemSettings).post(AddSystemSettings);
router
  .route("/admin/editsystemsettings/:settings_id")
  .patch(EditSystemSettings);

module.exports = router;
