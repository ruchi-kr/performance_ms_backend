const { StatusCodes } = require("http-status-codes");
const connection = require("../db");
const asyncConnection = require("../db2");

const ModuleDelayCalculator = async (req, res) => {
  const { project_id } = req.params;
  
  // `;
  // const query =`
  // SELECT
  //     mm.module_id,
  //     mm.module_name,
  //     mm.to_date,
  //     mm.from_date,
  //     tm.task_name,
  //     tm.task_id,
  //     MAX(DATEDIFF(e.actual_end_date, mm.to_date)) AS max_delay_days
  // FROM
  //     module_master mm
  // LEFT JOIN
  //     task_master tm ON mm.module_id = tm.module_id
  // LEFT JOIN
  //     employee e ON tm.task_id = e.task_id
  // JOIN
  //     project_master pm ON mm.project_id = pm.project_id
  // WHERE
  //     pm.project_id = ?
  //     AND mm.stage = 'inprocess'
  // GROUP BY
  //     mm.module_id, mm.module_name;`;
//   const query = `
// SELECT
//     mm.module_id,
//     mm.module_name,
//     mm.to_date,
//     mm.from_date,
//     tm.task_id,
//     tm.task_name,
//     MAX(DATEDIFF(IFNULL(e.actual_end_date, CURRENT_DATE), mm.to_date)) AS max_delay_days
// FROM
//     module_master mm
// LEFT JOIN
//     task_master tm ON mm.module_id = tm.module_id
// LEFT JOIN
//     employee e ON tm.task_id = e.task_id
// JOIN
//     project_master pm ON mm.project_id = pm.project_id
// WHERE
//     pm.project_id = ?
//     AND mm.stage = 'inprocess'
// GROUP BY
//     mm.module_id, mm.module_name;
// `;
const query =`
SELECT
    mm.module_id,
    mm.module_name,
    mm.to_date,
    mm.from_date,
    MAX(tm.task_id) AS task_id, -- Include task_id for reference, but it will be from the task with max delay
    MAX(tm.task_name) AS task_name, -- Include task_name for reference, but it will be from the task with max delay
    MAX(DATEDIFF(IFNULL(e.actual_end_date, CURRENT_DATE), mm.to_date)) AS max_delay_days
FROM
    module_master mm
LEFT JOIN
    task_master tm ON mm.module_id = tm.module_id
LEFT JOIN
    employee e ON tm.task_id = e.task_id
JOIN
    project_master pm ON mm.project_id = pm.project_id
WHERE
    pm.project_id = ?
    AND mm.stage = 'inprocess'
GROUP BY
    mm.module_id,
    mm.module_name,
    mm.to_date,
    mm.from_date
ORDER BY
    delay_days DESC;

`;
  try {
    const [moduleDelayData] = await asyncConnection.query(query, [
      project_id,
      project_id,
    ]);
    return res.status(StatusCodes.OK).json(moduleDelayData);
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};
const TasksDelayCalculator = async (req, res) => {
  const { module_id } = req.params;
  console.log("module_id",module_id)


//   const query = `
//     SELECT
//     mm.module_id,
//     mm.module_name,
//     tm.allocated_time as planned_allocated_time,
//     mm.to_date,
//     mm.from_date,
//     tm.task_id,
//     tm.task_name,
//     e.allocated_time,
//     e.actual_time,
//     e.created_at,
//     e.status,
//     e.actual_end_date,
//     em.employee_id,
//     em.name,
//     DATEDIFF(IFNULL(e.actual_end_date, CURRENT_DATE), mm.to_date) AS delay_days
// FROM
//     module_master mm
// LEFT JOIN
//     task_master tm ON mm.module_id = tm.module_id
// LEFT JOIN
//     employee e ON tm.task_id = e.task_id
// JOIN
//     project_master pm ON mm.project_id = pm.project_id
// LEFT JOIN 
// 	employee_master AS em ON em.employee_id=e.employee_id
// WHERE
//     mm.module_id = ?
//     AND mm.stage = 'inprocess';
//     `;

const query =`
SELECT
    mm.module_id,
    mm.module_name,
    tm.allocated_time as planned_allocated_time,
    mm.to_date,
    mm.from_date,
    em.name,
    tm.task_id,
    tm.task_name,
    e.allocated_time,
    e.actual_time,
    e.created_at,
    e.status,
    e.employee_id,
    e.actual_end_date,
    COALESCE(MAX(DATEDIFF(IFNULL(e.actual_end_date, CURRENT_DATE), mm.to_date)), 0) AS delay_days
FROM
    module_master mm
LEFT JOIN
    task_master tm ON mm.module_id = tm.module_id
LEFT JOIN
    employee e ON tm.task_id = e.task_id
LEFT JOIN
    employee_master em ON e.employee_id=em.employee_id
WHERE
    mm.module_id = ?
GROUP BY
    mm.module_id,
    mm.module_name,
    mm.to_date,
    mm.from_date,
    tm.task_id,
    tm.task_name
ORDER BY
    delay_days DESC;
`;

  try {
    const [taskDelayData] = await asyncConnection.query(query, [module_id]);
    console.log("task deata",taskDelayData)
    return res.status(StatusCodes.OK).json(taskDelayData);
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
};

module.exports = { ModuleDelayCalculator, TasksDelayCalculator };
