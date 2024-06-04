const {
  employeeMasterModel,
  rollbackEmployeeMasterModel,
} = require("./employee_master");
const {
  designationModel,
  rollbackDesignationModel,
} = require("./designation_master");
const {
  jobRoleMasterModel,
  rollbackJobRoleMasterModel,
} = require("./job_role_master");
const {
  managerRemarksModel,
  rollbackManagerRemarksModel,
} = require("./manager_remarks");
const {
  moduleMasterModel,
  rollbackModuleMasterModel,
} = require("./module_master");
const {
  projectMasterModel,
  rollbackProjectMasterModel,
} = require("./project_master");
const { teamModel, rollbackTeamModel } = require("./team");
const { userMasterModel, rollbackUserMasterModel } = require("./user_master");
const { employeeModel, rollbackEmployeeModel } = require("./employee");
const {
  projectPlanModel,
  rollbackProjectPlanModel,
} = require("./project_plan");
const {
  systemSettingsModel,
  rollbackSystemSettingsModel,
} = require("./system_settings");
const { taskMasterModel, rollbackTaskMasterModel } = require("./task_master");
const { createRelation } = require("./relation");
const initDatabase = async () => {
  await createTables();
};

const deleteTables = async () => {
  // await rollBackTables(false);
};

const createTables = async () => {
  await designationModel();
  await employeeMasterModel();
  await jobRoleMasterModel();
  await managerRemarksModel();
  await moduleMasterModel();
  await projectMasterModel();
  await teamModel();
  await userMasterModel();
  await employeeModel();
  await projectPlanModel();
  await systemSettingsModel();
  await taskMasterModel();
  await createRelation();
};
const rollBackTables = async (flag) => {
  if (flag) {
    rollbackEmployeeMasterModel();
    rollbackDesignationModel();
    rollbackJobRoleMasterModel();
    rollbackManagerRemarksModel();
    rollbackModuleMasterModel();
    rollbackProjectMasterModel();
    rollbackTeamModel();
    rollbackUserMasterModel();
    rollbackEmployeeModel();
    rollbackProjectPlanModel();
    rollbackSystemSettingsModel();
    rollbackTaskMasterModel();
  }
};

module.exports = { initDatabase };
