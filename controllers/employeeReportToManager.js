const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const ViewProjectReport = (req, res) => {
  const { reporting_manager_id } = req.params;
  const { toDate, fromDate, search, page = 1, pageSize = 10 } = req.query;

  console.log(
    "Search terms manager id------ yahan hun&&&",
    search,
    reporting_manager_id
  );
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  let altQuery = "";
  if (
    (toDate === null || toDate === "null" || toDate === undefined) &&
    (fromDate === null || fromDate === "null" || fromDate === undefined)
  ) {
    console.log("running default date range");
    altQuery = `
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
                  '"task_id":', IFNULL(e.id, 'null'), 
                  ', "task":"', IFNULL(tm.task_name, 'null'), 
                  '", "task_percent":', IFNULL(e.task_percent, 'null'),  
                  ', "allocated_time":', IFNULL(e.allocated_time, 'null'),  
                  ', "actual_time":', IFNULL(e.actual_time, 'null'),                 
                  ', "status":"', IFNULL(e.status, 'null'), 
                  '", "project_id":', IFNULL(e.project_id, 'null'), 
                  ', "project_name":"', IFNULL(pm.project_name, 'null'), 
                  '", "module_id":', IFNULL(mm.module_id, 'null'), 
                  ', "module_name":"', IFNULL(mm.module_name, 'null'), 
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
  LEFT JOIN
      employee_master AS em ON em.employee_id = e.employee_id
  LEFT JOIN 
      module_master AS mm ON e.module_id = mm.module_id
  LEFT JOIN 
      task_master AS tm ON tm.task_id = e.task_id
  WHERE 
      e.manager_id = ?
      AND e.created_at >= DATE_ADD(NOW(), INTERVAL -28 DAY) 
      AND
      (LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%')) OR ? = '')
  GROUP BY 
      e.employee_id, em.name, em.manager_id;
    `;
    //     altQuery = `
    //     SELECT
    //     e.employee_id,
    //     em.name,
    //     em.manager_id,
    //     SUM(e.allocated_time) AS total_allocated_time,
    //     SUM(e.actual_time) AS total_actual_time,
    //     CONCAT(
    //         '[',
    //         GROUP_CONCAT(
    //             CONCAT(
    //                 '{',
    //                 '"task_id":', e.id,
    //                 ', "task":"', tm.task_name,
    //                 '", "task_percent":', e.task_percent,
    //                 ', "allocated_time":', e.allocated_time,
    //                 ', "actual_time":', e.actual_time,
    //                 ', "status":"', e.status,
    //                 '", "project_id":', e.project_id,
    //                 ', "project_name":"', pm.project_name,
    //                 '", "module_id":', mm.module_id,
    //                 ', "module_name":"', mm.module_name,
    //                 '", "created_at":"', DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'),
    //                 '", "updated_at":"', DATE_FORMAT(e.updated_at, '%Y-%m-%d %H:%i:%s'),
    //                 '", "actual_end_date":"', DATE_FORMAT(e.actual_end_date, '%Y-%m-%d %H:%i:%s'),
    //                 '"}'
    //             ) SEPARATOR ', '
    //         ),
    //         ']'
    //     ) AS tasks_details
    // FROM
    //     employee AS e
    // LEFT JOIN
    //     project_master AS pm ON e.project_id = pm.project_id
    // LEFT JOIN
    //     employee_master AS em ON em.employee_id = e.employee_id
    // LEFT JOIN
    //     module_master AS mm ON e.module_id = mm.module_id
    // LEFT JOIN
    //     task_master AS tm ON tm.task_id = e.task_id
    // WHERE
    //     e.manager_id = ?
    //     AND e.created_at >= DATE_ADD(NOW(), INTERVAL -28 DAY)
    //     AND
    //     (LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%')) OR ? = '')
    // GROUP BY
    // e.employee_id;
    //     `;
  } else {
    console.log("Running specific date range query");
    altQuery = `
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
            '"task_id":', IFNULL(e.id, 'null'), 
            ', "task":"', IFNULL(tm.task_name, 'null'), 
            '", "task_percent":', IFNULL(e.task_percent, 'null'),  
            ', "allocated_time":', IFNULL(e.allocated_time, 'null'),  
            ', "actual_time":', IFNULL(e.actual_time, 'null'),                 
            ', "status":"', IFNULL(e.status, 'null'), 
            '", "project_id":', IFNULL(e.project_id, 'null'), 
            ', "project_name":"', IFNULL(pm.project_name, 'null'), 
            '", "module_id":', IFNULL(mm.module_id, 'null'), 
            ', "module_name":"', IFNULL(mm.module_name, 'null'), 
            '", "created_at":"', IFNULL(DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'), 'null'),
            '", "updated_at":"', IFNULL(DATE_FORMAT(e.updated_at, '%Y-%m-%d %H:%i:%s'), 'null'), 
            '", "actual_end_date":"', IFNULL(DATE_FORMAT(e.actual_end_date, '%Y-%m-%d %H:%i:%s'), 'null'), 
            '"}'
        )ORDER BY e.created_at DESC  SEPARATOR ', '
        ),
        ']'
    ) AS tasks_details
FROM 
    employee AS e
LEFT JOIN 
    project_master AS pm ON e.project_id = pm.project_id
LEFT JOIN
    employee_master AS em ON em.employee_id = e.employee_id
LEFT JOIN 
    module_master AS mm ON e.module_id = mm.module_id
LEFT JOIN 
    task_master AS tm ON tm.task_id = e.task_id
WHERE 
    e.manager_id = ?
    AND LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%'))
    AND DATE(e.created_at) BETWEEN ? AND ?
   
GROUP BY 
    e.employee_id;
    `;
  }

  try {
    connection.query(
      altQuery,
      [reporting_manager_id, search, toDate, fromDate],
      (err, results) => {
        console.log("results", results);
        if (results === undefined) {
          return res.status(StatusCodes.NO_CONTENT);
        }
        results = JSON.parse(JSON.stringify(results));
        const temp = results.map((item) => {
          return {
            ...item,
            tasks_details: JSON.parse(item.tasks_details),
          };
        });
        console.log("temp", temp);
        res.status(StatusCodes.OK).json(temp);
      }
    );
  } catch (error) {
    console.log(error);
  }
};
const ViewParticularEmployeeReportProjectWise = (req, res) => {
  const { reporting_manager_id, employee_id } = req.params;
  const { toDate, fromDate, search, page = 1, pageSize = 10 } = req.query;
  console.log("Search terms,reporting manager", search, reporting_manager_id);
  console.log("page", page, "---pageSize:", pageSize);
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  let altQuery = "";
  if (
    (toDate === null || toDate === "null" || toDate === undefined) &&
    (fromDate === null || fromDate === "null" || fromDate === undefined)
  ) {
    console.log("running default date range");
    altQuery = `
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
  LEFT JOIN
      employee_master AS em ON em.employee_id = e.employee_id
  WHERE 
      e.manager_id = ? AND e.employee_id =?
      AND e.created_at >= DATE_ADD(NOW(), INTERVAL -90 DAY) 
      AND
      (LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%')) OR ? = '')
  GROUP BY 
      e.employee_id;
      `;
  } else {
    console.log("Running specific date range query");
    altQuery = `
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
  LEFT JOIN
      employee_master AS em ON em.employee_id = e.employee_id
  WHERE 
      e.manager_id = ? AND e.employee_id=?
      AND LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%'))
      AND DATE(e.created_at) BETWEEN ? AND ?
     
  GROUP BY 
      e.employee_id;
      `;
  }

  try {
    connection.query(
      altQuery,
      [reporting_manager_id, employee_id, search, toDate, fromDate],
      (err, results) => {
        if (results === undefined) {
          return res.status(StatusCodes.NO_CONTENT);
        }
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

module.exports = { ViewProjectReport, ViewParticularEmployeeReportProjectWise };

//   const query = `
//   SELECT
//     e.employee_id,
//     em.name,
//     em.manager_id,
//     SUM(e.allocated_time) AS total_allocated_time,
//     SUM(e.actual_time) AS total_actual_time,
//     CONCAT(
//         '[',
//         GROUP_CONCAT(
//             CONCAT(
//                 '{',
//                 '"task_id":', e.id,
//                 ', "task":"', e.task,
//                 '", "allocated_time":', e.allocated_time,
//                 ', "actual_time":', e.actual_time,
//                 ', "status":"', e.status,
//                 '", "project_id":', e.project_id,
//                 ', "project_name":"', pm.project_name,
//                 '", "created_at":"', DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'),
//                 '"}'
//             ) SEPARATOR ', '
//         ),
//         ']'
//     ) AS tasks_details
// FROM
//     employee AS e
// LEFT JOIN
//     project_master AS pm ON e.project_id = pm.project_id
// LEFT JOIN
//     employee_master AS em ON em.employee_id = e.employee_id
// WHERE
//     e.manager_id = ?
//     AND LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%'))
//     AND e.created_at >= DATE_ADD(NOW(), INTERVAL -90 DAY)

// GROUP BY
//     e.employee_id;
//   `;
