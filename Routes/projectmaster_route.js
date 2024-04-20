const express = require('express');
const router = express.Router();
const mysql = require("mysql");

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'performancems'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});



// API FOR PROJECT CRUD

// CREATE project
router.post('/api/admin/addProject', (req, res) => {
    const { project_name, schedule_start_date, schedule_end_date} = req.body;
    const query = 'INSERT INTO project_master ( project_name, schedule_start_date,schedule_end_date) VALUES (?, ?, ?)';
    connection.query(query, [project_name, schedule_start_date,schedule_end_date], (err, results) => {
      if (err) throw err;
      res.status(200).send('Project Added Successfully');
    });
  });


// Get project
router.get('/api/admin/getProjects', (req, res) => {
    const query = 'SELECT * FROM project_master';
    connection.query(query, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  

// Edit project
router.post('/api/admin/editProject/:project_id', (req, res) => {
  const projectId = req.params.project_id; 
  
  if (!projectId) {
    return res.status(400).send('Project ID is required');
  }

  const fetchQuery = 'SELECT * FROM project_master WHERE project_id=?';
  const updateQuery = 'UPDATE project_master SET project_name=?, schedule_start_date =?, schedule_end_date=? WHERE 	project_id=?';

  // Fetch project by ID
  connection.query(fetchQuery, [projectId], (fetchErr, fetchResults) => {
    if (fetchErr) {
      return res.status(500).send('Error fetching project data');
    }

    if (fetchResults.length === 0) {
      return res.status(404).send('Project not found');
    }

    const existingProject = fetchResults[0];
    const { project_name, schedule_start_date, schedule_end_date} = req.body;

    // Update project data
    connection.query(updateQuery, [project_name, schedule_start_date, schedule_end_date, projectId], (updateErr, updateResults) => {
      if (updateErr) {
        return res.status(500).send('Error updating project');
      }

      // Fetch updated project data
      connection.query(fetchQuery, [projectId], (fetchUpdatedErr, fetchUpdatedResults) => {
        if (fetchUpdatedErr) {
          return res.status(500).send('Error fetching updated project data');
        }

        const updatedProject = fetchUpdatedResults[0];
        if (updatedProject) {
            res.status(200).json(updatedProject); // Return updated project data
        } else {
            res.status(500).send('Failed to fetch updated project data'); // Handle case where updated project data is not found
        }
      });
    });
  });
});

// DELETE project
router.delete('/api/admin/deleteProject/:project_id', (req, res) => {
    const ProjectId = req.params.project_id;
    const query = 'DELETE FROM project_master WHERE project_id=?';
    connection.query(query, [ProjectId], (err, results) => {
      if (err) throw err;
      res.send('Project deleted successfully');
    });
  });


  module.exports = router;