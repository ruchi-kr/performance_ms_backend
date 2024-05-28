const { StatusCodes } = require("http-status-codes");
const connection = require("../db");
const asyncConnection = require("../db2");

const ViewProjectReport = async (req, res) => {
  const { reporting_manager_id } = req.params;
  const { toDate, fromDate, search, stage } = req.query;
  console.log(
    "detailed report to manager -------> yahan hun ---->yahan hi hun22"
  );
  let stageSearch;
//   stage === "all" ? (stageSearch = "all") : (stageSearch = stage);

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
            pm.schedule_start_date,
            pm.schedule_end_date,
            SUM(e.allocated_time) AS total_allocated_time,
            SUM(e.actual_time) AS total_actual_time,
            SUM(tm.allocated_time) AS project_allocated_time,
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
                        '", "created_at":"', IFNULL(DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'), 'null'),
                        '", "updated_at":"', IFNULL(DATE_FORMAT(e.updated_at, '%Y-%m-%d %H:%i:%s'), 'null'), 
                        '", "actual_end_date":"', IFNULL(DATE_FORMAT(e.actual_end_date, '%Y-%m-%d %H:%i:%s'), 'null'),
                        '"}'
                    )ORDER BY e.created_at DESC SEPARATOR ', '
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
            e.created_at >= DATE_ADD(NOW(), INTERVAL -30 DAY)
        AND
            (LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%')) OR ? = '')
        AND
        (? = 'all' OR pm.stage = ?)
        GROUP BY 
            e.project_id
        ORDER BY
            pm.project_name;
        ;`;
  } else {
    console.log("Running specific date range query");

    altQuery = `
        SELECT 
            pm.project_id,
            pm.project_name,    
            pm.schedule_start_date,
            pm.schedule_end_date,
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
                        '", "created_at":"', IFNULL(DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'), 'null'),
                        '", "updated_at":"', IFNULL(DATE_FORMAT(e.updated_at, '%Y-%m-%d %H:%i:%s'), 'null'), 
                        '", "actual_end_date":"', IFNULL(DATE_FORMAT(e.actual_end_date, '%Y-%m-%d %H:%i:%s'), 'null'), 
                        '"}'
                    )ORDER BY e.created_at DESC SEPARATOR ', '
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
            (LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%')) OR ? = '')
        AND
            (? = 'all' OR pm.stage = ?)
        AND 
            DATE(e.created_at) BETWEEN ? AND ?
        GROUP BY 
            e.project_id
        ORDER BY
            pm.project_name;
        `;
  }

  const [totalManDays] = await asyncConnection.query(
    "SELECT pm.project_id,pm.project_name,pm.status,   SUM(CAST(tm.allocated_time AS DECIMAL(10, 2))) AS total_man_days FROM project_master AS pm LEFT JOIN   module_master AS mm ON pm.project_id = mm.project_id LEFT JOIN task_master AS tm ON mm.module_id = tm.module_id WHERE pm.status LIKE 'in progress' GROUP BY pm.project_id;"
  );
  //   console.log("total man days", totalManDays);
  try {
    const [results] = await asyncConnection.query(altQuery, [
      reporting_manager_id,
      search,
      search,
      stage,
      stage,
      toDate,
      fromDate,
    ]);

    // console.log("obj", results);

    const temp = results.map((item) => {
      console.log("project_id", item.project_id);
      const match = totalManDays.find((i) => i.project_id === item.project_id);
      // If a match is found, insert the total_allocated_hours into the second array
      if (match) {
        // console.log("match", match);
        item.total_allocated_man_days = match.total_man_days;
      }
      return {
        ...item,
        total_allocated_man_days: match.total_man_days * 8,
        tasks_details: JSON.parse(item.tasks_details),
      };
    });
    // console.log(temp);
    return res.status(StatusCodes.OK).json(temp);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};
module.exports = { ViewProjectReport };
