const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const connection =require("../db");

// API FOR CRUD EMPLOYEE

// CREATE
router.post('/api/user/addTask', (req, res) => {
    const { project_name, task,start_time, end_time,status,remarks } = req.body;
    const query = 'INSERT INTO employee ( project_name, task,start_time, end_time,status,remarks ) VALUES (?, ?, ?,?,?,?)';
    connection.query(query, [project_name, task,start_time, end_time,status,remarks], (err, results) => {
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
// DELETE




module.exports = router;