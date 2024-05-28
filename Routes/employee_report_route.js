const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");
const protectedRoute = require("../middleware/protectedResourceEmployee");

// for project-wise report
router.get("/api/user/getReportspw/:employee_id",protectedRoute, (req, res) => {
  const employee_id = req.params.employee_id;
  const { page, pageSize, name = "", fromDate = "", toDate = "" } = req.query;
  console.clear();
  // Validate page and pageSize  page, pageSize,
  if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
    return res.status(400).send("Invalid page or pageSize");
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let query = `
    SELECT 
    e.project_id,
    SUM(e.allocated_time) AS total_allocated_hours,
    SUM(e.actual_time) AS total_actual_hours,
    p.schedule_start_date,
    p.schedule_end_date,
    p.project_name,
    (
        SELECT CONCAT(
            '[',
            GROUP_CONCAT(
               JSON_OBJECT(
                    'module_name', m.module_name,
                    'to_date', m.to_date,
                    'from_date', m.from_date,
                    'status', m.status,
                    'stage', m.stage,
                    'tasks', (
                        SELECT CONCAT(
                            '[',
                            GROUP_CONCAT(
                              DISTINCT JSON_OBJECT(
                                  'task_name', t.task_name,
                                  'task_allocated_time', t.allocated_time,
                                  'stage', t.stage,
                                  'created_at',et.created_at,
                                  'updated_at',et.updated_at,
                                  'employee_allocated_time',et.allocated_time,
                                  'employee_actual_time',et.actual_time,
                                  'status',et.status,
                                  'per_task_efficiency',  (et.allocated_time / et.actual_time) * et.task_percent  
                                )
                            ),
                            ']'
                        )
                        FROM task_master t
                        JOIN employee et ON t.task_id = et.task_id
    WHERE t.module_id = m.module_id
    AND et.project_id = e.project_id
                       
                        AND t.task_id IN (
                          SELECT DISTINCT task_id
                          FROM employee
                          WHERE project_id = e.project_id
                        )
                       
                    )
                )
            ),
            ']'
        )
        FROM module_master m
        WHERE m.project_id = e.project_id
       
        AND m.module_id IN (
          SELECT DISTINCT module_id
          FROM employee
          WHERE project_id = e.project_id
      )
        `;

  if (fromDate && toDate) {
    query += ` AND DATE(e.created_at) BETWEEN ? AND ? `;
  }
  
  query += ` ) AS modules
    FROM employee e
    JOIN project_master p ON e.project_id = p.project_id
    WHERE e.user_id = ?
    AND p.project_name LIKE '%${name}%'
    GROUP BY e.project_id
              `;
  if (!fromDate && !toDate) {
    query += ` LIMIT ? OFFSET ?`;
  }

  console.log("query1", query);
  const queryParams =
    fromDate && toDate ? [fromDate, toDate, employee_id] : [employee_id];
  if (!fromDate && !toDate) {
    queryParams.push(parseInt(pageSize), offset);
  }
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      
      results = results.map((item) => {
        return {
            ...item,
            modules: JSON.parse(item.modules) ? JSON.parse(item.modules).map((module) => {
                return {
                    ...module,
                    tasks: JSON.parse(module.tasks)
                };
            }):[],
        };
    });
    }
    console.log("results of getreports", results);
    res.status(200).json(results);
  });
});

// for date - wise report
router.get("/api/user/getReportsdw/:employee_id",protectedRoute, (req, res) => {
  const employee_id = req.params.employee_id;

  const { page, pageSize, fromDate, toDate } = req.query;

  // Validate page and pageSize
  if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
    return res.status(400).send("Invalid page or pageSize");
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let query = `
  SELECT
  DATE(e.created_at) AS date,
  CONCAT(
      '[',
      GROUP_CONCAT(
          DISTINCT JSON_OBJECT(
              'project_id', e.project_id,
              'project_name', p.project_name,
              'modules',(
                  SELECT
                      CONCAT(
                          '[',
                          GROUP_CONCAT(
                              DISTINCT JSON_OBJECT(
                                  'module_id', m.module_id,
                                  'module_name', m.module_name,
                                  'tasks', (
                                      SELECT CONCAT(
                                          '[',
                                          GROUP_CONCAT(
                                              JSON_OBJECT(
                                                  'task_id', t.task_id,
                                  'task_name', t.task_name,
                                  'task_allocated_time', t.allocated_time,
                                  'stage', t.stage,
                                  'created_at',e.created_at,
                                  'employee_allocated_time',e.allocated_time,
                                  'employee_actual_time',e.actual_time,
                                  'status',e.status   
                                              )
                                          ),
                                          ']'
                                      )
                                  FROM task_master t
                                  WHERE t.module_id = m.module_id AND t.task_id = e.task_id
                                    AND e.user_id = e.user_id
                                      AND DATE(e.created_at) = DATE(e.created_at)
                                  GROUP BY t.module_id = m.module_id
                              ) )
                          ),
                          ']'
                      )
                  FROM module_master m WHERE m.module_id = e.module_id
                  AND e.user_id = e.user_id
                      AND DATE(e.created_at) = DATE(e.created_at)
                           GROUP BY e.project_id = m.project_id
              
          ) )
      ),
      ']'
  ) AS projects
FROM employee e
JOIN
  project_master p ON e.project_id = p.project_id
WHERE e.user_id = ?
      `;

  const params = [employee_id, fromDate, toDate];

  if (fromDate && toDate) {
    query += ` AND DATE(e.created_at) BETWEEN ? AND ? `;
    params.push(fromDate, toDate);
  }
// else{
//   query += `AND DATE(e.created_at) >= DATE_ADD(NOW(), INTERVAL -28 DAY)`;
// }
  query += `
    GROUP BY
      DATE(e.created_at)
      LIMIT ${parseInt(pageSize)} OFFSET ${offset}
     `;

  params.push(parseInt(pageSize), offset);

  connection.query(query, params, (err, results) => {
    if (err){
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    }
    results = results.map((item) => {
      return {
          ...item,
          projects: JSON.parse(item.projects) ? JSON.parse(item.projects).map((project) => {
              return {
                  ...project,
                  modules: JSON.parse(project.modules) ? JSON.parse(project.modules).map((tasks) => {
                    return{
                        ...tasks,
                        tasks: JSON.parse(tasks.tasks)
                    };
                  }):[],
                  };
              
          }):[],
      };
  });
  
  console.log("results of getreports date wise", results);
  res.status(200).json(results);
    // res.status(200).json(results);
  });
});

module.exports = router;
