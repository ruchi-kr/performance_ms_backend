const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const ViewProjectReport = (req, res) => {
  const { reporting_manager_id } = req.params;
  const { toDate, fromDate, search } = req.query;
  console.log(
    "detailed report to manager -------> yahan hun ---->yahan hi hun111"
  );
  console.log("Search terms", search);
  console.log("toDate", toDate, "---fromDate:", fromDate);
  let altQuery = "";
  if (
    (toDate === null || toDate === "null" || toDate === undefined) &&
    (fromDate === null || fromDate === "null" || fromDate === undefined)
  ) {
    console.log("running default date range");
    altQuery = `
    SELECT 
    pm.project_id,
    pm.project_name,
    SUM(e.allocated_time) AS total_allocated_time,
    SUM(e.actual_time) AS total_actual_time,
    CONCAT(
        '[',
        GROUP_CONCAT(
            CONCAT(
                '{', 
                '"task_id":', e.id, 
                ',"employee_id":', e.employee_id, 
                ', "name":"',em.name,                
                '", "task":"', tm.task_name, 
                '","module_id":', mm.module_id, 
                ',"planned_task_allocated_time":', tm.allocated_time, 
                ', "module_name":"',mm.module_name,
                '", "task_percent":',e.task_percent,
                ', "allocated_time":', e.allocated_time,  
                ', "actual_time":', e.actual_time,                 
                ', "status":"', e.status, 
                '", "project_id":', e.project_id, 
                ', "project_name":"', pm.project_name, 
                '", "created_at":"', DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'), 
                '"}'
            ) SEPARATOR ', '
        ),
        ']'
    ) AS tasks_details
FROM 
    employee AS e
LEFT JOIN 
    project_master AS pm ON e.project_id = pm.project_id
JOIN
    employee_master AS em ON em.employee_id = e.employee_id
LEFT JOIN 
    task_master AS tm ON tm.task_id = e.task_id
LEFT JOIN
    module_master AS mm ON e.module_id = mm.module_id
WHERE 
    e.manager_id = ?
AND
    e.created_at >= DATE_ADD(NOW(), INTERVAL -28 DAY)
AND
(LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%')) OR ? = '')
GROUP BY 
    e.project_id;   `;
  } else {
    console.log("Running specific date range query");

    altQuery = `
    SELECT 
    pm.project_id,
    pm.project_name,    
    SUM(e.allocated_time) AS total_allocated_time,
    SUM(e.actual_time) AS total_actual_time,
    CONCAT(
        '[',
        GROUP_CONCAT(
            CONCAT(
                '{', 
                '"task_id":', e.id, 
                ',"employee_id":', e.employee_id, 
                ', "name":"',em.name,                
                '", "task":"', tm.task_name, 
                '","module_id":', mm.module_id,    
                ',"planned_task_allocated_time":', tm.allocated_time,             
                ', "module_name":"',mm.module_name,
                '", "task_percent":',e.task_percent,
                ', "allocated_time":', e.allocated_time,  
                ', "actual_time":', e.actual_time,                 
                ', "status":"', e.status, 
                '", "project_id":', e.project_id, 
                ', "project_name":"', pm.project_name, 
                '", "created_at":"', DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'), 
                '"}'
            ) SEPARATOR ', '
        ),
        ']'
    ) AS tasks_details
FROM 
    employee AS e
LEFT JOIN 
    project_master AS pm ON e.project_id = pm.project_id
JOIN
    employee_master AS em ON em.employee_id = e.employee_id
LEFT JOIN 
    task_master AS tm ON tm.task_id = e.task_id
LEFT JOIN
    module_master AS mm ON e.module_id = mm.module_id
WHERE 
    e.manager_id = ?
AND 
    LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%'))
AND 
    DATE(e.created_at) BETWEEN ? AND ?
GROUP BY 
    e.project_id;   
    `;
  }

  try {
    connection.query(
      altQuery,
      [reporting_manager_id, search, toDate, fromDate],
      (err, results) => {
        console.log("results-->", results);
        results = JSON.parse(JSON.stringify(results));
        const temp = results.map((item) => {
          // console.log("obj", item);
          return {
            ...item,
            tasks_details: JSON.parse(item.tasks_details),
          };
        });
        res.status(StatusCodes.OK).json(temp);
      }
    );
  } catch (error) {
    console.log(error);
  }
};
module.exports = { ViewProjectReport };
