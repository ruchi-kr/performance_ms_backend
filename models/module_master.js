const asyncConnection = require("../db2");

const moduleMasterModel = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS module_master (
    module_id int(20) NOT NULL,
    project_id int(20) NOT NULL,
    task_id int(20) DEFAULT NULL,
    module_name varchar(100) NOT NULL,
    to_date timestamp NOT NULL DEFAULT current_timestamp(),
    from_date timestamp NOT NULL DEFAULT current_timestamp(),
    status enum('scrapped','ongoing','completed','notstarted') NOT NULL DEFAULT 'notstarted',
    stage enum('rfp','lost','won','inprocess','completed') DEFAULT 'rfp',
    PRIMARY KEY (module_id)
  )
    `;

  try {
    const [results] = await asyncConnection.query(query);
    console.log("module_master table created successfully", results);
  } catch (error) {
    console.log("failed to create module_master table", error);
  }
};

const rollbackModuleMasterModel = async () => {
  const query = `
    DROP TABLE IF EXISTS module_master;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("module_master table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop module_master table:", error);
    throw error;
  }
};
module.exports = { moduleMasterModel,rollbackModuleMasterModel };
