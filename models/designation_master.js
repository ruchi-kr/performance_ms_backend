const asyncConnection = require("../db2");

const designationModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS designation_master (
    designation_id int(20) NOT NULL AUTO_INCREMENT,
    designation_name varchar(100) NOT NULL,
    PRIMARY KEY (designation_id),
    UNIQUE KEY designation_name (designation_name)
  )
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log(results);
    console.log("designation_master table created");
  } catch (error) {
    console.log("failed to create designation_master table");
  }
};
const rollbackDesignationModel = async () => {
  const query = `
    DROP TABLE IF EXISTS designation_master;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("Designation table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop designation table:", error);
    throw error;
  }
};

module.exports = { designationModel, rollbackDesignationModel };
