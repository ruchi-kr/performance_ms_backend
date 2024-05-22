const { StatusCodes } = require("http-status-codes");
const connection = require("../db");
const connectionAsync = require("../db2");
const AddSystemSettings = async (req, res) => {
  const { manHrsPerDay } = req.body;
  console.log("man hrs per day", manHrsPerDay);
  const query = "INSERT INTO system_settings (manHrsPerDay) VALUES (?)";

  const [checkData] = await connectionAsync.query(
    "SELECT COUNT(*) AS count from system_settings"
  );
  console.log("check data", checkData[0].count);
  if (checkData[0].count === 0) {
    try {
      const [results] = await connectionAsync.execute(query, [manHrsPerDay]);
      return res.status(StatusCodes.OK).json({ msg: "addded" });
    } catch (error) {
      return res
        .status(StatusCodes.OK)
        .json({ msg: "failed to add settings catch   " });
    }
  } else {
    return res.status(StatusCodes.OK).json({ msg: "failed to add settings" });
  }
};
const GetSystemSettings = async (req, res) => {
  const query = "SELECT * FROM system_settings";
  const [results] = await connectionAsync.query(query);
  res.status(StatusCodes.OK).json({ data: results });
};

const EditSystemSettings = async (req, res) => {
  const { manHrsPerDay, settings_id } = req.body;
  console.log("man hrs per day in edit", manHrsPerDay,settings_id);
  const query =
    "UPDATE system_settings SET manHrsPerDay = ? WHERE settings_id = ?";

  try {
    const [results] = await connectionAsync.query(query, [
      manHrsPerDay,
      settings_id,
    ]);
    console.log("edited",results)
    return res.status(StatusCodes.OK).json({ msg: "edited" });
  } catch (error) {
    console.log("error",error)
    return res.status(StatusCodes.OK).json({ msg: "failed to edit settings" });
  }
};

module.exports = { AddSystemSettings, GetSystemSettings, EditSystemSettings };
