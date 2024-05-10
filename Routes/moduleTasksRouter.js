const express = require("express");
const router = express.Router();

const {
  GetAllModuleTasks,
  AddModuleTasks,
  DeleteModuleTask,
  EditModuleTask,
} = require("../controllers/moduleTasksController");

router.route("/module/task").get(GetAllModuleTasks).post(AddModuleTasks);
router
  .route("/module/task/:task_id")
  .delete(DeleteModuleTask)
  .patch(EditModuleTask );

module.exports = router;
