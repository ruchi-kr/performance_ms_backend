const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");


// API FOR Designation CRUD

// CREATE designation
router.post('/api/admin/addDesignation', (req, res) => {
    const { designation_name } = req.body;
    const query = 'INSERT INTO designation_master ( designation_name) VALUES (?)';
    connection.query(query, [designation_name], (err, results) => {
        if (err) throw err;
        res.status(200).send('designation Added Successfully');
    });
});

// Get designation
router.get('/api/admin/getAllDesignation', (req, res) => {
    const { page, pageSize } = req.query;
  
    // Validate page and pageSize
    if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
      return res.status(400).send('Invalid page or pageSize');
    }
  
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    // const query ='SELECT rmm.*,em.name as employee_name FROM `reporting_manager_master` as rmm LEFT JOIN employee_master as em On rmm.employee_id = em.employee_id LIMIT ? OFFSET ?';    // JOIN user_master as us ON em.employee_id = us.employee_id

    const query = `SELECT * FROM designation_master LIMIT ? OFFSET ?`;
  
    connection.query(query, [parseInt(pageSize), offset], (err, results) => {
      if (err) throw err;
      res.status(200).send(results);
    });
  });

// Edit designation
router.post('/api/admin/editDesignation/:designation_id', (req, res) => {
    const DesignationId = req.params.designation_id;

    if (!DesignationId) {
        return res.status(400).send('Designation Id is required');
    }

    const fetchQuery = 'SELECT * FROM designation_master WHERE designation_id=?';
    const updateQuery = 'UPDATE designation_master SET designation_name=? WHERE designation_id=?';

    // Fetch designation by ID
    connection.query(fetchQuery, [DesignationId], (fetchErr, fetchResults) => {
        if (fetchErr) {
            return res.status(500).send('Error fetching designation data');
        }

        if (fetchResults.length === 0) {
            return res.status(404).send('designation not found');
        }

        const existingManager = fetchResults[0];
        const { designation_name } = req.body;

        // Update designation data
        connection.query(updateQuery, [ designation_name, DesignationId], (updateErr, updateResults) => {
            if (updateErr) {
                return res.status(500).send('Error updating designation');
            }

            // Fetch updated designation data
            connection.query(fetchQuery, [DesignationId], (fetchUpdatedErr, fetchUpdatedResults) => {
                if (fetchUpdatedErr) {
                    return res.status(500).send('Error fetching updated designation data');
                }

                const updatedDesignation = fetchUpdatedResults[0];
                if (updatedDesignation) {
                    res.status(200).json(updatedDesignation); // Return updated project data
                } else {
                    res.status(500).send('Failed to fetch updated designation data'); // Handle case where updated project data is not found
                }
            });
        });
    });
});



router.delete('/api/admin/deleteDesignation/:designation_id', (req, res) => {
    const DesignationId = req.params.designation_id;

    // Check if the designation is assigned to any employee
    const checkQuery = 'SELECT COUNT(*) as count FROM designation_master WHERE designation_id = ?';
    connection.query(checkQuery, [DesignationId], (checkErr, checkResults) => {
        if (checkErr) throw checkErr;

        if (checkResults[0].count > 0) {
            res.status(400).send({ error: "designation cannot be deleted as it is assigned to an employee" });
        } else {
            const deleteQuery = 'DELETE FROM designation_master WHERE designation_id = ?';
            connection.query(deleteQuery, [DesignationId], (deleteErr, deleteResults) => {
                if (deleteErr) throw deleteErr;
                res.send('designation deleted successfully');
            });
        }
    });
});

// get list of all designation
router.get('/api/admin/getDesignationList', (req, res) => {

    const query = 'SELECT * FROM designation_master';
    // const query ='SELECT rmm.*,em.name as manager_name FROM `reporting_manager_master` as rmm LEFT JOIN employee_master as em On rmm.employee_id = em.employee_id';    // JOIN user_master as us ON em.employee_id = us.employee_id

    connection.query(query, (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    })
})


module.exports = router;