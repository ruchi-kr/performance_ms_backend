const express = require("express");
const router = express.Router();
const protectedRoute = require("../middleware/protectedResourceManager");

const { EditRemark } = require("../controllers/remarkController");

router.route("/project/task/:task_id").patch(protectedRoute,EditRemark);

module.exports = router;
