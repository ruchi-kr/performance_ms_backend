const asyncConnection = require("../db2");

const managerRemarksModel = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS manager_remarks (
    remark_id int(20) NOT NULL AUTO_INCREMENT,
    remark_type enum('week','month','quater','half','year') DEFAULT 'week',
    employee_id int(20) NOT NULL,
    manager_id int(20) NOT NULL,
    remark varchar(100) NOT NULL,
    rating float NOT NULL DEFAULT 2.5,
    from_date datetime NOT NULL,
    to_date datetime NOT NULL,
    created_at timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (remark_id)
   
  )
    `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("manager_remarks table created successfully", results);
  } catch (error) {
    console.log("failed to create manager_remarks table", error);
  }
};
const rollbackManagerRemarksModel = async () => {
  const query = `
    DROP TABLE IF EXISTS manager_remarks;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("manager_remarks table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop manager_remarks table:", error);
    throw error;
  }
};
module.exports = { managerRemarksModel,rollbackManagerRemarksModel };
