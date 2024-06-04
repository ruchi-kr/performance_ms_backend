const asyncConnection = require("../db2");

const projectPlanModel = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS project_plan (
    plan_id int(20) NOT NULL,
    project_id int(20) NOT NULL,
    module_id int(20) NOT NULL,
    stage enum('rfp','lost','won','inprocess','completed') NOT NULL,
    PRIMARY KEY (plan_id)
   
  )
    `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("projectPlan model created successfully", results);
  } catch (error) {
    console.log("failed to create projectPlan model", error);
  }
};

const rollbackProjectPlanModel = async () => {
  const query = `
    DROP TABLE IF EXISTS project_plan;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("project_plan table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop project_plan table:", error);
    throw error;
  }
};

module.exports = {projectPlanModel,rollbackProjectPlanModel};
