const connect = require("../db");
const asyncConnection = require("../db2");

const employeeMasterModel = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS employee_master (
    employee_id int(11) NOT NULL AUTO_INCREMENT,
    manager_id int(20) DEFAULT NULL,
    designation_id int(20) NOT NULL,
    job_id int(20) DEFAULT NULL,
    email varchar(100) NOT NULL,
    name varchar(100) NOT NULL,
    doj datetime NOT NULL,
    dob date NOT NULL,
    experience decimal(10,2) NOT NULL,
    skills varchar(100) NOT NULL,
    mobile_no varchar(50) NOT NULL,
    PRIMARY KEY (employee_id),
    UNIQUE KEY email (email)   
  )    
    `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("employee model created successfully", results);
  } catch (error) {
    console.log("failed to create employee table", error);
  }
};

const rollbackEmployeeMasterModel = async () => {
  const query = `
    DROP TABLE IF EXISTS employee_master;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("employee_master table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop employee_master table:", error);
    throw error;
  }
};
module.exports = { employeeMasterModel, rollbackEmployeeMasterModel };
