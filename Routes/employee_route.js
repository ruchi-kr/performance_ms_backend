const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");
const dayjs = require("dayjs");

const utc = require("dayjs/plugin/utc");
const moment = require("moment");
// API FOR CRUD EMPLOYEE

// CREATE
router.post("/api/user/addTask", (req, res) => {
  const {
    project_id,
    user_id,
    employee_id,
    manager_id,
    module_id,
    allocated_time,
    actual_time,
    task_percent,
    end_time,
    status,
    remarks,
    task_id,
    adhoc,
  } = req.body;
  let actual_end_date = null;
  if (status === "completed") {
    actual_end_date = moment.utc().format();
  }
  const query =
    "INSERT INTO employee ( project_id,module_id,employee_id,manager_id,user_id, allocated_time, actual_time,task_percent,status,remarks,actual_end_date,adhoc,task_id ) VALUES (?,?,?,?,?, ?, ?,?,?,?,?,?,?)";
  connection.query(
    query,
    [
      project_id,
      module_id,
      employee_id,
      manager_id,
      user_id,    
      allocated_time,
      actual_time,
      task_percent,
      status,
      remarks,
      actual_end_date,
      adhoc,
      task_id,
    ],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        res.status(200).send("Task Added Successfully");
      }
    }
  );
});

// GET
router.get("/api/user/getTasks/:employee_id", (req, res) => {
  const employee_id = req.params.employee_id;
  // const query =
    // "SELECT * FROM employee WHERE user_id= ? AND ((DATE(created_at)=CURRENT_DATE() OR status = 'inprocess' OR status = 'notstarted') OR (DATE(actual_end_date)=CURRENT_DATE() AND status = 'completed'))";
 
    // const query =
  //   "SELECT employee.* , em.* FROM employee JOIN user_master AS um ON um.user_id = employee.user_id JOIN employee_master AS em ON em.employee_id = um.employee_id WHERE employee.employee_id= ?";
  
  const query= `SELECT e.*, t.task_name, m.module_name
  FROM employee e
  LEFT JOIN task_master t ON e.task_id = t.task_id
  LEFT JOIN module_master m ON e.module_id = m.module_id
  WHERE e.user_id = ?
  AND (
      (DATE(e.created_at) = CURRENT_DATE() OR e.status = 'inprocess' OR e.status = 'notstarted') 
      OR 
      (DATE(e.actual_end_date) = CURRENT_DATE() AND e.status = 'completed')
  )`;
  
  connection.query(query, [employee_id], (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      res.status(200).json(results);
    }
  });
});

// EDIT
// UPDATE
router.put("/api/user/updateTask/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const {
    user_id,
    module_id,
    allocated_time,
    actual_time,
    task_percent,
    status,
    remarks,
    project_id,
    employee_id,
    manager_id,
    end_time,
    task_id,
  } = req.body;
  let actual_end_date = null;
  if (status === "completed") {
    actual_end_date = moment.utc().format();
  }

  const query =
    "UPDATE employee SET project_id = ?,module_id=?,user_id=?, employee_id=? ,manager_id=?,allocated_time = ?, actual_time = ?,task_percent=?, status = ?, remarks = ?,actual_end_date=?,task_id=? WHERE id = ?";
  connection.query(
    query,
    [
      project_id,
      module_id,
      user_id,
      employee_id,
      manager_id,
      allocated_time,
      actual_time,
      task_percent,
      status,
      remarks,
      actual_end_date,
      task_id,
      taskId,
    ],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        res.status(200).send("Task Updated Successfully");
      }
    }
  );
});

// DELETE
router.delete("/api/user/deleteTask/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const query = "DELETE FROM employee WHERE id = ?";
  connection.query(query, [taskId], (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      res.status(200).send("Task Deleted Successfully");
    }
  });
});

module.exports = router;
