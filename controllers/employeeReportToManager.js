const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const ViewProjectReport = (req, res) => {
  const { reporting_manager_id } = req.params;
  const { toDate, fromDate, search, page = 1, pageSize = 10 } = req.query;
  console.log("Search terms", search);
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
    e.manager_id = ?
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
const ViewParticularEmployeeReportProjectWise = (req, res) => {
  const { reporting_manager_id, employee_id } = req.params;
  const { toDate, fromDate, search, page = 1, pageSize = 10 } = req.query;
  console.log("Search terms", search);
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
