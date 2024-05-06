const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");


// API FOR Module Master CRUD

// CREATE module
router.post('/api/admin/addModule', (req, res) => {
    const { module_name,project_id } = req.body;
    const query = 'INSERT INTO module_master ( module_name,project_id) VALUES (?,?)';
    connection.query(query, [module_name,project_id], (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: 'An error occurred while processing your request.' });
          } else {
            res.status(200).send('Module Added Successfully');
          }
       
    });
});

// Get Module
router.get('/api/admin/getAllModule', (req, res) => {
    const { page, pageSize,name="" } = req.query;

    // Validate page and pageSize
    if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
        return res.status(400).send('Invalid page or pageSize');
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const query = `SELECT * FROM module_master WHERE module_name LIKE '%${name}%' LIMIT ? OFFSET ?`;

    connection.query(query, [parseInt(pageSize), offset], (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: 'An error occurred while processing your request.' });
          } else {
            res.status(200).send(results);
          }
    });
});

// Edit module
router.post('/api/admin/editModule/:module_id', (req, res) => {
    const ModuleId = req.params.module_id;

    if (!ModuleId) {
        return res.status(400).send('Module Id is required');
    }

    const fetchQuery = 'SELECT * FROM module_master WHERE module_id=?';
    const updateQuery = 'UPDATE module_master SET module_name=?,project_id=? WHERE module_id=?';

    // Fetch designation by ID
    connection.query(fetchQuery, [ModuleId], (fetchErr, fetchResults) => {
        if (fetchErr) {
            return res.status(500).send('Error fetching module data');
        }

        if (fetchResults.length === 0) {
            return res.status(404).send('module not found');
        }

        const existingModule = fetchResults[0];
        const { module_name,project_id } = req.body;

        // Update designation data
        connection.query(updateQuery, [module_name, project_id, ModuleId], (updateErr, updateResults) => {
            if (updateErr) {
                return res.status(500).send('Error updating module');
            }

            // Fetch updated designation data
            connection.query(fetchQuery, [ModuleId], (fetchUpdatedErr, fetchUpdatedResults) => {
                if (fetchUpdatedErr) {
                    return res.status(500).send('Error fetching updated module data');
                }

                const updatedModule = fetchUpdatedResults[0];
                if (updatedModule) {
                    res.status(200).json(updatedModule); // Return updated project data
                } else {
                    res.status(500).send('Failed to fetch updated module data'); // Handle case where updated project data is not found
                }
            });
        });
    });
});


// delete module
router.delete('/api/admin/deleteModule/:module_id', (req, res) => {
    const ModuleId = req.params.module_id;

    // Check if the module is assigned to any employee
    const checkQuery = 'SELECT COUNT(*) as count FROM module_master WHERE module_id = ?';
    connection.query(checkQuery, [ModuleId], (checkErr, checkResults) => {
        if (checkErr) throw checkErr;

        if (checkResults[0].count > 0) {
            res.status(400).send({ error: "Module cannot be deleted as it is assigned to an employee" });
        } else {
            const deleteQuery = 'DELETE FROM module_master WHERE module_id = ?';
            connection.query(deleteQuery, [ModuleId], (deleteErr, deleteResults) => {
                if (deleteErr) throw deleteErr;
                res.status(200).send('Module Deleted Successfully');
            });
        }
    });
});

// // get list of all designation
// router.get('/api/admin/getDesignationList', (req, res) => {

//     const query = 'SELECT * FROM designation_master';
//     // const query ='SELECT rmm.*,em.name as manager_name FROM `reporting_manager_master` as rmm LEFT JOIN employee_master as em On rmm.employee_id = em.employee_id';    // JOIN user_master as us ON em.employee_id = us.employee_id

//     connection.query(query, (err, results) => {
//         if (err) {
//             console.log(err);
//             res.status(500).json({ error: 'An error occurred while processing your request.' });
//           } else {
//             res.status(200).send(results);
//           }
       
//     })
// })


module.exports = router;