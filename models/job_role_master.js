const asyncConnection = require("../db2");

const jobRoleMasterModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS job_role_master (
        job_id int(20) NOT NULL AUTO_INCREMENT,
        job_role_name varchar(100) NOT NULL,
        PRIMARY KEY (job_id),
        UNIQUE KEY job_role_name (job_role_name)
      )
    `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("job_role_master table created successfully", results);
  } catch (error) {
    console.log("failed to create job_role_master table", error);
  }
};
const rollbackJobRoleMasterModel = async () => {
  const query = `
    DROP TABLE IF EXISTS job_role_master;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("job_role_master table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop job_role_master table:", error);
    throw error;
  }
};
module.exports = { jobRoleMasterModel ,rollbackJobRoleMasterModel};
