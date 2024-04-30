const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const ViewProjectReport = (req, res) => {
  const { reporting_manager_id } = req.params;
  console.log("{reporting_manager_id}", reporting_manager_id);
  const query = `
  SELECT 
    e.employee_id, 
    em.name,
    em.manager_id,
    SUM(e.allocated_time) AS total_allocated_time,
    SUM(e.actual_time) AS total_actual_time,
    CONCAT(
        '[',
        GROUP_CONCAT(
            CONCAT(
                '{', 
                '"task_id":', e.id, 
                ', "task":"', e.task, 
                '", "allocated_time":', e.allocated_time,  
                ', "actual_time":', e.actual_time, 
                
                ', "status":"', e.status, 
                '", "project_id":', e.project_id, 
                ', "project_name":"', pm.project_name, 
                '"}'
            ) SEPARATOR ', '
        ),
        ']'
    ) AS tasks_details
FROM 
    employee AS e
LEFT JOIN 
    project_master AS pm ON e.project_id = pm.project_id
LEFT JOIN
    employee_master AS em ON em.employee_id = e.employee_id
WHERE 
    e.manager_id = ?
GROUP BY 
    e.employee_id;
  `;

  try {
    connection.query(query, reporting_manager_id, (err, results) => {
      results = JSON.parse(JSON.stringify(results));
      const temp = results.map((item) => {
        console.log("obj", item);
        return {
          ...item,
          tasks_details: JSON.parse(item.tasks_details),
        };
      });
      res.status(StatusCodes.OK).json(results);
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = { ViewProjectReport };
