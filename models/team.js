const asyncConnection = require("../db2");

const teamModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS team (
      team_id int(11) NOT NULL AUTO_INCREMENT,
      project_id int(11) DEFAULT NULL,
      employee_id varchar(400) DEFAULT NULL,
      reporting_manager_id int(11) NOT NULL,
      PRIMARY KEY (team_id),
      UNIQUE KEY project_id (project_id)  
    )
    `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("team table created successfully", results);
  } catch (error) {
    console.log("failed to create team table", error);
  }
};
const rollbackTeamModel = async () => {
  const query = `
    DROP TABLE IF EXISTS team;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("team table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop team table:", error);
    throw error;
  }
};
module.exports = { teamModel ,rollbackTeamModel};
