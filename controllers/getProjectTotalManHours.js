const { StatusCodes } = require("http-status-codes");
const connectionAsync = require("../db2");

const GetProjectTotalManHours = async (req, res) => {
  try {
    const [totalManDays] = await connectionAsync.query(
      "SELECT pm.project_id,pm.project_name,pm.status,   SUM(CAST(tm.allocated_time AS DECIMAL(10, 2))) AS total_man_days FROM project_master AS pm LEFT JOIN   module_master AS mm ON pm.project_id = mm.project_id LEFT JOIN task_master AS tm ON mm.module_id = tm.module_id WHERE pm.status LIKE 'in progress' GROUP BY pm.project_id;"
    );

    return res.status(StatusCodes.OK).json({ data: totalManDays });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Internal server error" });
  }
};

module.exports = { GetProjectTotalManHours };
