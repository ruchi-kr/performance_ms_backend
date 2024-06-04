const asyncConnection = require("../db2");

const userMasterModel = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS user_master (
    user_id int(20) NOT NULL AUTO_INCREMENT,
    employee_id int(20) NOT NULL,
    email_id varchar(100) DEFAULT NULL,
    mobile_no varchar(100) NOT NULL,
    user_type tinyint(1) NOT NULL,
    role enum('manager','employee','management') DEFAULT NULL,
    password varchar(255) NOT NULL,
    hashed_password varchar(255) NOT NULL,
    status enum('active','inactive') NOT NULL,
    created_by int(20) DEFAULT NULL,
    created_at timestamp NULL DEFAULT current_timestamp(),
    updated_at timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
    PRIMARY KEY (user_id),
    UNIQUE KEY email_id (email_id)  
  )
    `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("user_master table created successfully", results);
  } catch (error) {
    console.log("failed to create user_master table", error);
  }
};
const rollbackUserMasterModel = async () => {
  const query = `
    DROP TABLE IF EXISTS user_master;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("user_master table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop user_master table:", error);
    throw error;
  }
};

module.exports = { userMasterModel,rollbackUserMasterModel };
