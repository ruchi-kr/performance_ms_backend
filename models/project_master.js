const asyncConnection = require("../db2");

const projectMasterModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS project_master (
      project_id int(50) NOT NULL AUTO_INCREMENT,
      project_name varchar(100) NOT NULL,
      project_details varchar(250) DEFAULT NULL,
      schedule_start_date timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      schedule_end_date timestamp NULL DEFAULT NULL,
      module_id int(20) DEFAULT NULL,
      stage enum('rfp','lost','won','inprocess','completed','scrapped') NOT NULL,
      actual_start_date datetime NOT NULL,
      actual_end_date datetime DEFAULT NULL,
      status enum('in progress','completed','delayed') NOT NULL,
      PRIMARY KEY (project_id)
    )
    `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("project_master table created successfully", results);
  } catch (error) {
    console.log("failed to create project_master table", error);
  }
};
const rollbackProjectMasterModel = async () => {
  const query = `
    DROP TABLE IF EXISTS project_master;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("project_master table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop project_master table:", error);
    throw error;
  }
};
module.exports = { projectMasterModel,rollbackProjectMasterModel };
