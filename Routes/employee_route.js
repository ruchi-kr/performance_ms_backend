const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");

// API FOR CRUD EMPLOYEE

// CREATE
router.post("/api/user/addTask", (req, res) => {
  const {
    project_id,
    user_id,
    employee_id,
    manager_id,
    task,
    allocated_time,
    actual_time,
    end_time,
    status,
    remarks,
  } = req.body;
  const query =
    "INSERT INTO employee ( project_id,employee_id,manager_id,user_id, task,allocated_time, actual_time,status,remarks ) VALUES (?,?,?, ?, ?,?,?,?,?)";
  connection.query(
    query,
    [
      project_id,
      employee_id,
      manager_id,
      user_id,
      task,
      allocated_time,
      actual_time,
      status,
      remarks,
    ],
    (err, results) => {
      if (err) throw err;
      res.status(200).send("Task Added Successfully");
    }
  );
});

// GET
router.get("/api/user/getTasks/:employee_id", (req, res) => {
  const employee_id = req.params.employee_id;
  const query = 'SELECT * FROM employee WHERE user_id= ? AND DATE(created_at)=CURRENT_DATE()';
  // const query =
  //   "SELECT employee.* , em.* FROM employee JOIN user_master AS um ON um.user_id = employee.user_id JOIN employee_master AS em ON em.employee_id = um.employee_id WHERE employee.employee_id= ?";
  connection.query(query, [employee_id], (err, results) => {
    if (err) throw err;
    res.status(200).json(results);
  });
});

// EDIT
// UPDATE
router.put("/api/user/updateTask/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const {
    user_id,
    task,
    allocated_time,
    actual_time,
    status,
    remarks,
    project_id,
    employee_id,
    manager_id,
    end_time,
  } = req.body;
  const query =
    "UPDATE employee SET project_id = ?,user_id=?, task = ?, employee_id=? ,manager_id=?,allocated_time = ?, actual_time = ?, status = ?, remarks = ? WHERE id = ?";
  connection.query(
    query,
    [
      project_id,
      user_id,
      task,
      employee_id,
      manager_id,
      allocated_time,
      actual_time,
      status,
      remarks,
      taskId,
    ],
    (err, results) => {
      if (err) throw err;
      res.status(200).send("Task Updated Successfully");
    }
  );
});

// DELETE
router.delete("/api/user/deleteTask/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const query = "DELETE FROM employee WHERE id = ?";
  connection.query(query, [taskId], (err, results) => {
    if (err) throw err;
    res.status(200).send("Task Deleted Successfully");
  });
});

// router.get("/api/user/getReports/:employee_id", (req, res) => {
//   const employee_id = req.params.employee_id;

//   const { page, pageSize, name = "" } = req.query;

//   // Validate page and pageSize
//   if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
//     return res.status(400).send("Invalid page or pageSize");
//   }

//   const offset = (parseInt(page) - 1) * parseInt(pageSize);


//   const query = `SELECT e.project_id, 
// SUM(e.allocated_time) AS total_allocated_hours, 
// SUM(e.actual_time) AS total_actual_hours,
// p.schedule_start_date,
// p.schedule_end_date,
// p.project_name,
// (
//   SELECT CONCAT(
//       '[',
//       GROUP_CONCAT(
//           JSON_OBJECT(
//               'task', t.task, 
//               'created_at', t.created_at,
//               'status', t.status, 
//               'allocated_time', t.allocated_time, 
//               'actual_time', t.actual_time
//           )
//       ),
//       ']'
//   )
//   FROM employee t
//   WHERE t.project_id = e.project_id
// )AS tasks
// FROM employee e
// JOIN project_master p ON e.project_id = p.project_id
// WHERE e.user_id = ?
// AND p.project_name LIKE '%${name}%'
// GROUP BY e.project_id
// LIMIT ? OFFSET ?`;


//   connection.query(query, [employee_id, parseInt(pageSize), offset], (err, results) => {
//     if (err) throw err;

//     res.status(200).json(results);
//   });
// });


// router.get("/api/user/getReports/:employee_id", (req, res) => {
//   const employee_id = req.params.employee_id;
//   const { page, pageSize, name = "", fromDate="", toDate="" } = req.query;

//   // Validate page and pageSize
//   if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
//     return res.status(400).send("Invalid page or pageSize");
//   }

//   const offset = (parseInt(page) - 1) * parseInt(pageSize);

//   const query = `
//     SELECT e.project_id,
//       SUM(e.allocated_time) AS total_allocated_hours,
//       SUM(e.actual_time) AS total_actual_hours,
//       p.schedule_start_date,
//       p.schedule_end_date,
//       p.project_name,
//       (
//         SELECT CONCAT(
//           '[',
//           GROUP_CONCAT(
//             JSON_OBJECT(
//               'task', t.task,
//               'created_at', t.created_at,
//               'status', t.status,
//               'allocated_time', t.allocated_time,
//               'actual_time', t.actual_time
//             )
//           ),
//           ']'
//         )
//         FROM employee t
//         WHERE t.project_id = e.project_id
//         AND t.created_at BETWEEN ? AND ?
//       ) AS tasks
//       FROM employee e
//       JOIN project_master p ON e.project_id = p.project_id
//       WHERE e.user_id = ?
//       AND p.project_name LIKE '%${name}%'
//       GROUP BY e.project_id
//       LIMIT ? OFFSET ? `;

//   connection.query(
//     query,
//     [fromDate, toDate, employee_id, parseInt(pageSize), offset],
//     (err, results) => {
//       if (err) throw err;
//       res.status(200).json(results);
//     }
//   );


  
//   // ${fromDate ? `AND (t.created_at >= ? OR t.created_at IS NULL)` : ''} 
//   // ${toDate ? `AND (t.created_at <= ? OR t.created_at IS NULL)` : ''}
//   // (t.created_at >= ? OR t.created_at IS NULL) AND (t.created_at <= ? OR t.created_at IS NULL)
// });

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

  const { page, pageSize} = req.query;

  // Validate page and pageSize
  if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
    return res.status(400).send("Invalid page or pageSize");
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);


  const query = `SELECT e.project_id,
  e.created_at,
         SUM(e.allocated_time) AS total_allocated_hours,
         SUM(e.actual_time) AS total_actual_hours,
        
         p.project_name,
         (
             SELECT CONCAT(
                 '[',
                 GROUP_CONCAT(
                     JSON_OBJECT(
                         'task', t.task,                      
                         'allocated_time', t.allocated_time,
                         'actual_time', t.actual_time
                     )
                 ),
                 ']'
             )
             FROM employee t
             WHERE t.project_id = e.project_id
                 AND t.user_id = e.user_id
         ) AS tasks
  FROM employee e
  JOIN project_master p ON e.project_id = p.project_id
  WHERE e.user_id = ?
  GROUP BY e.project_id, DATE(e.created_at);
  `;


  connection.query(query, [employee_id, parseInt(pageSize), offset], (err, results) => {
    if (err) throw err;

    res.status(200).json(results);
  });
});

module.exports = router;
