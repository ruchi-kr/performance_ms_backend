const asyncConnection = require("../db2");

const systemSettingsModel = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS system_settings (
    settings_id int(11) NOT NULL,
    manHrsPerDay int(11) NOT NULL DEFAULT 8,
    PRIMARY KEY (settings_id)
  )
`;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("system_settings table created successfully", results);
  } catch (error) {
    console.log("failed to create system_settings table", error);
  }
};
const rollbackSystemSettingsModel = async () => {
  const query = `
    DROP TABLE IF EXISTS system_settings;
  `;
  try {
    const [results] = await asyncConnection.query(query);
    console.log("system_settings table dropped successfully", results);
  } catch (error) {
    console.error("Failed to drop system_settings table:", error);
    throw error;
  }
};
module.exports = { systemSettingsModel,rollbackSystemSettingsModel };
