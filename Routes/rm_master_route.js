const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const connection =require("../db");


// API FOR REPORTING MANAGER CRUD
// CREATE manager
router.post('/api/admin/addManager', (req, res) => {
    const { name, designation, department } = req.body;
    const query = 'INSERT INTO reporting_manager_master ( name, designation, department) VALUES (?, ?, ?)';
    connection.query(query, [name, designation, department], (err, results) => {
        if (err) throw err;
        res.status(200).send('Manager Added Successfully');
    });
});


// Get manager
router.get('/api/admin/getManagers', (req, res) => {
    const query = 'SELECT * FROM reporting_manager_master';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    });
});


// Edit manager
router.post('/api/admin/editManager/:reporting_manager_id', (req, res) => {
    const ManagerId = req.params.reporting_manager_id;

    if (!ManagerId) {
        return res.status(400).send('Manager ID is required');
    }

    const fetchQuery = 'SELECT * FROM reporting_manager_master WHERE reporting_manager_id=?';
    const updateQuery = 'UPDATE reporting_manager_master SET name=?, designation =?, department=? WHERE reporting_manager_id=?';

    // Fetch project by ID
    connection.query(fetchQuery, [ManagerId], (fetchErr, fetchResults) => {
        if (fetchErr) {
            return res.status(500).send('Error fetching manager data');
        }

        if (fetchResults.length === 0) {
            return res.status(404).send('Manager not found');
        }

        const existingManager = fetchResults[0];
        const { name, designation, department } = req.body;

        // Update project data
        connection.query(updateQuery, [name, designation, department, ManagerId], (updateErr, updateResults) => {
            if (updateErr) {
                return res.status(500).send('Error updating manager');
            }

            // Fetch updated project data
            connection.query(fetchQuery, [ManagerId], (fetchUpdatedErr, fetchUpdatedResults) => {
                if (fetchUpdatedErr) {
                    return res.status(500).send('Error fetching updated manager data');
                }

                const updatedManager = fetchUpdatedResults[0];
                if (updatedManager) {
                    res.status(200).json(updatedManager); // Return updated project data
                } else {
                    res.status(500).send('Failed to fetch updated manager data'); // Handle case where updated project data is not found
                }
            });
        });
    });
});

// DELETE manager
router.delete('/api/admin/deleteManager/:reporting_manager_id', (req, res) => {
    const ManagerId = req.params.reporting_manager_id;
    const query = 'DELETE FROM reporting_manager_master WHERE reporting_manager_id=?';
    connection.query(query, [ManagerId], (err, results) => {
        if (err) throw err;
        res.send('Manager deleted successfully');
    });
});

// get list of all manager
router.get('/api/admin/getManagersList', (req, res) => {
  
  const query = 'SELECT * FROM reporting_manager_master';

  connection.query(query, (err, results) => {
    if (err) throw err;
    res.status(200).json(results);
  })
})


module.exports = router;