const asyncConnection = require("../db2");

const taskMasterModel = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS task_master (
    task_id int(20) NOT NULL,
    task_name varchar(100) NOT NULL,
    description varchar(500) DEFAULT NULL,
    module_id int(11) DEFAULT NULL,
    allocated_time decimal(10,2) NOT NULL DEFAULT 0.00,
    stage enum('rfp','lost','won','inprocess','completed') DEFAULT NULL,
    job_id int(11) DEFAULT NULL,
    count int(11) NOT NULL DEFAULT 0,
    days decimal(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (task_id)
  
  )
    `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("task_master table created successfully", results);
  } catch (error) {
    console.log("failed to create task_master table", error);
  }
};
const rollbackTaskMasterModel = async () => {
  const query = `
    DROP TABLE IF EXISTS task_master;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("task_master table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop task_master table:", error);
    throw error;
  }
};
module.exports = { taskMasterModel,rollbackTaskMasterModel };
