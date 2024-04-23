const express = require("express");
const router = express.Router();

const { EditRemark } = require("../controllers/remarkController");

router.route("/project/task/:task_id").patch(EditRemark);

module.exports = router;
