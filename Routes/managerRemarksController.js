const express = require("express");
const router = express.Router();

const protectedRouteonlytoken = require("../middleware/protectedResource");
const protectedRoute = require("../middleware/protectedResourceManager");

const {
  GetManagerRemarks,       //E && M
  AddManagerRemarks,
  EditManagerRemarks,
  DeleteManagerRemarks,
} = require("../controllers/managerRemarksController");

router
  .route("/employee/remark/:reporting_manager_id/:employee_id")
  .get(protectedRouteonlytoken,GetManagerRemarks);
router
  .route("/employee/remark/:reporting_manager_id/:employee_id")
  .post(protectedRoute,AddManagerRemarks);
router
  .route("/employee/remark/:reporting_manager_id/:employee_id   /:remark_id")
  .patch(protectedRoute,EditManagerRemarks)
  .delete(protectedRoute,DeleteManagerRemarks);

module.exports = router;
