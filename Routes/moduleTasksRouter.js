const express = require("express");
const router = express.Router();

const protectedRouteonlytoken = require("../middleware/protectedResource");
const protectedRoute = require("../middleware/protectedResourceM+A");

const {
  GetAllModuleTasks,  //A && M
  AddModuleTasks,  //A && M
  DeleteModuleTask, //A && M
  GetModuleTasks,   //ALL
  EditModuleTask,  //A && M
} = require("../controllers/moduleTasksController");

router.route("/module/task").get(protectedRoute,GetAllModuleTasks).post(protectedRoute,AddModuleTasks);
router.route("/module/task/:module_id").get(protectedRouteonlytoken,GetModuleTasks);
router
  .route("/module/task/:task_id")
  .delete(protectedRoute,DeleteModuleTask)
  .patch(protectedRoute,EditModuleTask);

module.exports = router;
