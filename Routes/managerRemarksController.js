const express = require("express");
const router = express.Router();

const {
  GetManagerRemarks,
  AddManagerRemarks,
  EditManagerRemarks,
  DeleteManagerRemarks,
} = require("../controllers/managerRemarksController");

router
  .route("/employee/remark/:reporting_manager_id/:employee_id")
  .get(GetManagerRemarks);
router
  .route("/employee/remark/:reporting_manager_id/:employee_id")
  .post(AddManagerRemarks);
router
  .route("/employee/remark/:reporting_manager_id/:employee_id   /:remark_id")
  .patch(EditManagerRemarks)
  .delete(DeleteManagerRemarks);

module.exports = router;
