const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");

// API FOR CRUD EMPLOYEE

// CREATE
router.post('/api/user/addTask', (req, res) => {
    const { project_name, task, allocated_time, actual_time, end_time, status, remarks } = req.body;
    const query = 'INSERT INTO employee ( project_name, task,allocated_time, actual_time,status,remarks ) VALUES (?, ?, ?,?,?,?)';
    connection.query(query, [project_name, task, allocated_time, actual_time, status, remarks], (err, results) => {
        if (err) throw err;
        res.status(200).send('Task Added Successfully');
    });
});

// GET
router.get('/api/user/getTasks', (req, res) => {
    const query = 'SELECT * FROM employee';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    });
});

// EDIT
// UPDATE
router.put('/api/user/updateTask/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const { project_name, task, allocated_time, actual_time, status, remarks } = req.body;
    const query = 'UPDATE employee SET project_name = ?, task = ?, allocated_time = ?, actual_time = ?, status = ?, remarks = ? WHERE id = ?';
    connection.query(query, [project_name, task, allocated_time, actual_time, status, remarks, taskId], (err, results) => {
        if (err) throw err;
        res.status(200).send('Task Updated Successfully');
    });
});

// DELETE
router.delete('/api/user/deleteTask/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const query = 'DELETE FROM employee WHERE id = ?';
    connection.query(query, [taskId], (err, results) => {
        if (err) throw err;
        res.status(200).send('Task Deleted Successfully');
    });
});





module.exports = router;