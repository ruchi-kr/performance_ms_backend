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
    task_percent,
    end_time,
    status,
    remarks,
  } = req.body;
  const query =
    "INSERT INTO employee ( project_id,employee_id,manager_id,user_id, task,allocated_time, actual_time,task_percent,status,remarks ) VALUES (?,?,?, ?, ?,?,?,?,?,?)";
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
      task_percent,
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
  const query =
    "SELECT * FROM employee WHERE user_id= ? AND (DATE(created_at)=CURRENT_DATE() OR status = 'inprocess' OR status = 'notstarted');";
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
    task_percent,
    status,
    remarks,
    project_id,
    employee_id,
    manager_id,
    end_time,
  } = req.body;
  const query =
    "UPDATE employee SET project_id = ?,user_id=?, task = ?, employee_id=? ,manager_id=?,allocated_time = ?, actual_time = ?,task_percent=?, status = ?, remarks = ? WHERE id = ?";
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
      task_percent,
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

module.exports = router;
