const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mysql = require("mysql");

const app = express();
const port = 8000;


app.use(cors());
app.use(express.json());

app.use(morgan("tiny"));

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

// api for employee CRUD
// CREATE
app.post('/api/admin/addEmployee', (req, res) => {
  const {name, designation, doj, experience,skills,mobile_no,email,reporting_manager_id} = req.body;
  const query = 'INSERT INTO employee_master ( name, designation, doj, experience,skills,mobile_no,email,reporting_manager_id) VALUES (?, ?, ?,?,?,?,?,?)';
  connection.query(query, [name, designation, doj, experience, skills, mobile_no, email, reporting_manager_id], (err, results) => {
    if (err) throw err;
    res.status(200).send('Employee Added Successfully');
  });
});

// GET
app.get('/api/admin/getEmployees', (req, res) => {
  // const query = 'SELECT * FROM employee_master';
  const query ='SELECT em.*,rmm.name as reporting_name FROM `employee_master` as em LEFT JOIN reporting_manager_master as rmm On rmm.reporting_manager_id = em.reporting_manager_id';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.status(200).json(results);
  });
});
// EDIT
app.post('/api/admin/editEmployee/:employee_id', (req, res) => {
  const employeeId = req.params.employee_id; 
  
  if (!employeeId) {
    return res.status(400).send('Employee ID is required');
  }

  const fetchQuery = 'SELECT * FROM employee_master WHERE employee_id=?';
  const updateQuery = 'UPDATE employee_master SET name=?, designation=?, doj=?, experience=?,skills=?,mobile_no=?,email=?,reporting_manager_id=? WHERE employee_id=?';

  // Fetch project by ID
  connection.query(fetchQuery, [employeeId], (fetchErr, fetchResults) => {
    if (fetchErr) {
      return res.status(500).send('Error fetching employee data');
    }

    if (fetchResults.length === 0) {
      return res.status(404).send('employee not found');
    }

    const existingProject = fetchResults[0];
    const { name, designation, doj, experience,skills,mobile_no,email,reporting_manager_id} = req.body;

    // Update project data
    connection.query(updateQuery, [name, designation, doj, experience,skills,mobile_no,email,reporting_manager_id, employeeId], (updateErr, updateResults) => {
      if (updateErr) {
        return res.status(500).send('Error updating employee');
      }

      // Fetch updated project data
      connection.query(fetchQuery, [employeeId], (fetchUpdatedErr, fetchUpdatedResults) => {
        if (fetchUpdatedErr) {
          return res.status(500).send('Error fetching updated employee data');
        }

        const updatedEmployee = fetchUpdatedResults[0];
        if (updatedEmployee) {
            res.status(200).json(updatedEmployee); // Return updated project data
        } else {
            res.status(500).send('Failed to fetch updated employee data'); // Handle case where updated project data is not found
        }
      });
    });
  });
});
// DELETE
app.delete('/api/admin/deleteEmployee/:employee_id', (req, res) => {
  const EmployeeId = req.params.employee_id;
  const query = 'DELETE FROM employee_master WHERE employee_id=?';
  connection.query(query, [EmployeeId], (err, results) => {
    if (err) throw err;
    res.send('employee deleted successfully');
  });
});

// API FOR PROJECT CRUD
// CREATE project
app.post('/api/admin/addProject', (req, res) => {
    const { project_name, schedule_start_date, schedule_end_date} = req.body;
    const query = 'INSERT INTO project_master ( project_name, schedule_start_date,schedule_end_date) VALUES (?, ?, ?)';
    connection.query(query, [project_name, schedule_start_date,schedule_end_date], (err, results) => {
      if (err) throw err;
      res.status(200).send('Project Added Successfully');
    });
  });


// Get project
  app.get('/api/admin/getProjects', (req, res) => {
    const query = 'SELECT * FROM project_master';
    connection.query(query, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  

// Edit project
app.post('/api/admin/editProject/:project_id', (req, res) => {
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
app.delete('/api/admin/deleteProject/:project_id', (req, res) => {
    const ProjectId = req.params.project_id;
    const query = 'DELETE FROM project_master WHERE project_id=?';
    connection.query(query, [ProjectId], (err, results) => {
      if (err) throw err;
      res.send('Project deleted successfully');
    });
  });
  
// API FOR USER CRUD
// CREATE
app.post('/api/admin/addUser', (req, res) => {
  const { username, status, user_type, password,employee_id} = req.body;
  const query = 'INSERT INTO user_master ( username, status, user_type, password,employee_id) VALUES (?, ?, ?, ?,?)';
  // console.log(query);
  connection.query(query, [username, status, user_type, password,employee_id], (err, results) => {
    if (err) throw err;
    res.status(200).send('User Added Successfully');
  });
});
// GET
app.get('/api/admin/getUsers', (req, res) => {
  // const query = 'SELECT * FROM user_master';
  const query ='SELECT um.*,em.name as employee_name FROM `user_master` as um RIGHT JOIN employee_master as em On em.employee_id = um.employee_id';
  // console.log(query);
  connection.query(query, (err, results) => {
    if (err) throw err;
    console.log(results);
    res.status(200).json(results);
  });
});
// EDIT
app.post('/api/admin/editUser/:user_id', (req, res) => {
  const UserId = req.params.user_id; 
  
  if (!UserId) {
    return res.status(400).send('User ID is required');
  }

  const fetchQuery = 'SELECT * FROM user_master WHERE user_id=?';
  const updateQuery = 'UPDATE user_master SET username=?, status =?, user_type=?, password=? WHERE user_id=?';

  // Fetch project by ID
  connection.query(fetchQuery, [UserId], (fetchErr, fetchResults) => {
    if (fetchErr) {
      return res.status(500).send('Error fetching user data');
    }

    if (fetchResults.length === 0) {
      return res.status(404).send('User not found');
    }

    const existingUser = fetchResults[0];
    const { username, status, user_type, password} = req.body;

    // Update project data
    connection.query(updateQuery, [username, status, user_type, password, UserId], (updateErr, updateResults) => {
      if (updateErr) {
        return res.status(500).send('Error updating user');
      }

      // Fetch updated project data
      connection.query(fetchQuery, [UserId], (fetchUpdatedErr, fetchUpdatedResults) => {
        if (fetchUpdatedErr) {
          return res.status(500).send('Error fetching updated user data');
        }

        const updatedUser = fetchUpdatedResults[0];
        if (updatedUser) {
            res.status(200).json(updatedUser); // Return updated project data
        } else {
            res.status(500).send('Failed to fetch updated user data'); // Handle case where updated project data is not found
        }
      });
    });
  });
});
// DELETE
app.delete('/api/admin/deleteUser/:user_id', (req, res) => {
  const UserId = req.params.user_id;
  const query = 'DELETE FROM user_master WHERE user_id=?';
  connection.query(query, [UserId], (err, results) => {
    if (err) throw err;
    res.status(200).send(' User deleted successfully');
  });
});

// API FOR REPORTING MANAGER CRUD
// CREATE manager
app.post('/api/admin/addManager', (req, res) => {
  const { name, designation, department} = req.body;
  const query = 'INSERT INTO reporting_manager_master ( name, designation, department) VALUES (?, ?, ?)';
  connection.query(query, [name, designation, department], (err, results) => {
    if (err) throw err;
    res.status(200).send('Manager Added Successfully');
  });
});


// Get manager
app.get('/api/admin/getManagers', (req, res) => {
  const query = 'SELECT * FROM reporting_manager_master';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.status(200).json(results);
  });
});


// Edit manager
app.post('/api/admin/editManager/:reporting_manager_id', (req, res) => {
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
  const { name, designation, department} = req.body;

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
app.delete('/api/admin/deleteManager/:reporting_manager_id', (req, res) => {
  const ManagerId = req.params.reporting_manager_id;
  const query = 'DELETE FROM reporting_manager_master WHERE reporting_manager_id=?';
  connection.query(query, [ManagerId], (err, results) => {
    if (err) throw err;
    res.send('Manager deleted successfully');
  });
});

// get list of all manager
app.get('/api/admin/getManagersList', (req, res) => {
  
  const query = 'SELECT * FROM reporting_manager_master';

  connection.query(query, (err, results) => {
    if (err) throw err;
    res.status(200).json(results);
  })
})
// get list of all employee
app.get('/api/admin/getEmployeesList', (req, res) => {
  
  const query = 'SELECT * FROM employee_master';

  connection.query(query, (err, results) => {
    if (err) throw err;
    res.status(200).json(results);
  })
})

app.listen( port, ()=>{
    console.log(`Listening on port ${port}`);
})
