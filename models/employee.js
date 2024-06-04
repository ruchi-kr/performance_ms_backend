const asyncConnection = require("../db2");

const employeeModel = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS employee (
    id int(50) NOT NULL,
    user_id int(20) NOT NULL,
    employee_id int(20) NOT NULL,
    manager_id int(20) DEFAULT NULL,
    project_id int(20) DEFAULT NULL,
    module_id int(20) DEFAULT NULL,
    task_id int(20) NOT NULL,
    project_name varchar(255) NOT NULL,
    allocated_time decimal(10,2) NOT NULL,
    actual_time decimal(10,2) DEFAULT NULL,
    task_percent decimal(10,2) DEFAULT NULL,
    status enum('inprocess','completed','notstarted','transfer') DEFAULT NULL,
    adhoc tinyint(1) NOT NULL,
    remarks varchar(255) DEFAULT NULL,
    manager_remarks varchar(255) DEFAULT NULL,
    created_by int(20) DEFAULT NULL,
    created_at timestamp NOT NULL DEFAULT current_timestamp(),
    updated_at timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
    actual_end_date timestamp NULL DEFAULT NULL,
    PRIMARY KEY (id)    
  )
`;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("employee table created successfully", results);
  } catch (error) {
    console.log("failed to create employee table", error);
  }
};

const rollbackEmployeeModel = async () => {
  const query = `
    DROP TABLE IF EXISTS employee;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("employee table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop employee table:", error);
    throw error;
  }
};
module.exports = { employeeModel,rollbackEmployeeModel };
