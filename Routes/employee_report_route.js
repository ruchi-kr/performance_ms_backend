const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");

// for project-wise report
router.get("/api/user/getReportspw/:employee_id", (req, res) => {
    const employee_id = req.params.employee_id;
    const { name = "", fromDate="", toDate="" } = req.query;
   console.clear();
    // // Validate page and pageSize  page, pageSize, 
    // if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
    //   return res.status(400).send("Invalid page or pageSize");
    // }
  
    // const offset = (parseInt(page) - 1) * parseInt(pageSize);
  
    let query = `
      SELECT e.project_id,
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
                'task', t.task,
                'created_at', t.created_at,
                'status', t.status,
                'allocated_time', t.allocated_time,
                'actual_time', t.actual_time
              )
            ),
            ']'
          )
          FROM employee t
          WHERE t.project_id = e.project_id
          AND t.user_id = e.user_id`;
  
    const params = [employee_id];
  
    if (fromDate && toDate) {
      query += ` AND DATE(t.created_at) BETWEEN ? AND ? `;
      params.push(fromDate, toDate);
    }
  
    query += `) AS tasks
              FROM employee e
              JOIN project_master p ON e.project_id = p.project_id
              WHERE e.user_id = ?
              AND p.project_name LIKE '%${name}%'
              GROUP BY e.project_id 
              `;
  
    console.log("query1",query)
    connection.query(
      query,
      [...params],
      (err, results) => {
        if (err) throw err;
        console.log("results of getreports",results)
        res.status(200).json(results);
        // LIMIT ? OFFSET ?  // [...params, parseInt(pageSize), offset],
      }
    );
    console.log("query2",query)
  });
  

// for date - wise report
router.get("/api/user/getReportsdw/:employee_id", (req, res) => {
  const employee_id = req.params.employee_id;

  const { page, pageSize, fromDate, toDate } = req.query;

  // Validate page and pageSize
  if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
    return res.status(400).send("Invalid page or pageSize");
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let query = `
    SELECT
      (e.created_at) AS date,
      SUM(e.allocated_time) AS total_allocated_hours,
      SUM(e.actual_time) AS total_actual_hours,
      CONCAT(
        '[',
        GROUP_CONCAT(
          DISTINCT JSON_OBJECT(
            'project_id', e.project_id,
            'project_name', p.project_name,
            'tasks',(
              SELECT
                CONCAT(
                  '[',
                  GROUP_CONCAT(
                    DISTINCT JSON_OBJECT(
                      'task', t.task,
                      'status', t.status,
                      'allocated_time', t.allocated_time,
                      'actual_time', t.actual_time
                    )
                  ),
                  ']'
                )
              FROM
                employee t
              WHERE
                t.project_id = e.project_id
                AND t.user_id = e.user_id
                AND DATE(t.created_at) = DATE(e.created_at)
              GROUP BY
                e.project_id = t.project_id
            )
          )
        ),
        ']'
      ) AS projects
    FROM
      employee e
    JOIN
      project_master p ON e.project_id = p.project_id
    WHERE
      e.user_id = ?
      `;

  const params = [employee_id, fromDate, toDate];

  if (fromDate && toDate) {
    query += ` AND DATE(e.created_at) BETWEEN ? AND ? `;
    params.push(fromDate, toDate);
  }

  query += `
    GROUP BY
      DATE(e.created_at)
      LIMIT ${parseInt(pageSize)} OFFSET ${offset}
     `;

  params.push( parseInt(pageSize),offset);

  connection.query(query, params, (err, results) => {
    if (err) throw err;

    res.status(200).json(results);
  });
});



module.exports = router;