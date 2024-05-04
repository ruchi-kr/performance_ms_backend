const express = require("express");
const router = express.Router();

const { GetCurrentTime } = require("../controllers/currentTimeController");
router.route("/CurrentTimeStamp").get(GetCurrentTime);
module.exports = router;
