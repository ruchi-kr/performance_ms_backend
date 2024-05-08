const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");
const { StatusCodes } = require("http-status-codes");

// API FOR Module Master CRUD
// CREATE module
router.post("/api/admin/addModule", (req, res) => {
  const { module_name, project_id } = req.body;
  // const module_array = JSON.stringify(module_name.map((module) => module.item));
  const module_array = JSON.stringify(module_name.map((module) => ({
    item: module.item,
    to_date: module.to_date,
    from_date: module.from_date
  })));
  console.log("module_array", module_array);
  module_name.forEach((module) => {

    if (module.to_date < module.from_date) {
      res.status(400).send("Invalid date range: to_date should be greater than or equal to from_date");
      return; // Exit the loop if the condition is not met
    }

    const query =
      "INSERT INTO module_master ( module_name,to_date,from_date,project_id) VALUES (?,?,?,?)";
    connection.query(query, [module.item,module.to_date, module.from_date, project_id], (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      }
    });
  });
  res.status(200).send("Module Added Successfully");
});

// Get Module
router.get("/api/admin/getAllModule/", (req, res) => {
  const { page = 1, pageSize = 10, name = "" } = req.query;
  // Validate page and pageSize
  if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
    return res.status(400).send("Invalid page or pageSize");
  }

  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  const query = `
  SELECT 
    mm.project_id,
    pm.project_name,
    pm.schedule_start_date,
    pm.schedule_end_date,
    CONCAT('[', COALESCE(
        GROUP_CONCAT(CONCAT('{"module_id": ', mm.module_id, ', "item": "', mm.module_name, '","to_date": "', mm.to_date, '", "from_date": "', mm.from_date, '"}') SEPARATOR ','), 
        '[]'
    ), ']') AS module_name
FROM 
    module_master as mm
LEFT JOIN project_master as pm 
ON pm.project_id = mm.project_id
GROUP BY 
    project_id;
`;

  connection.query(query, [parseInt(pageSize), offset], (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      const temp = results.map((item) => {
        console.log(item.modules);
        console.log(item.modules);
        return {
          ...item,
          module_name: JSON.parse(item.module_name),
        };
      });
      res.status(200).send(temp);
    }
  });
});


// Get Module for project
router.get("/api/admin/getAllModule/:project_id", (req, res) => {
  const { project_id } = req.params;
  console.log("project_id", project_id);
  const query = `
  SELECT 
    mm.project_id,
    pm.project_name,
    CONCAT('[', COALESCE(
        GROUP_CONCAT(CONCAT('{"module_id": ', mm.module_id, ', "item": "', mm.module_name, '"}') SEPARATOR ','), 
        '[]'
    ), ']') AS module_name
FROM 
    module_master as mm
LEFT JOIN project_master as pm 
ON pm.project_id = mm.project_id
WHERE mm.project_id = ?
GROUP BY 
    project_id;
`;

  connection.query(query, [project_id], (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      const temp = results.map((item) => {
        return {
          ...item,
          module_name: JSON.parse(item.module_name),
        };
      });
      res.status(200).send(temp);
    }
  });
});

// Edit module
// router.post("/api/admin/editModule/:project_id", (req, res) => {
//   const ModuleId = req.params.module_id;
//   const { project_id } = req.params;
//   const { module_name } = req.body;
//   console.log("{ project_id, module_name }", project_id, module_name);
//   const updates = module_name.filter((item) => item.module_id);
//   const creates = module_name.filter((item) => !item.module_id);
//   console.log("updates", updates);
//   console.log("creates", creates);

//   updates.forEach((module) => {
//     try {
//       const query =
//         "UPDATE module_master SET module_name=?,project_id=? WHERE module_id=?";
//       connection.query(
//         query,
//         [module.item, project_id, module.module_id],
//         (err, results) => {
//           if (err) {
//             console.log("error");
//           }
//         }
//       );
//     } catch (error) {}
//   });
//   creates.forEach((module) => {
//     try {
//       const query =
//         "INSERT INTO module_master ( module_name,project_id) VALUES (?,?)";
//       connection.query(query, [module.item, project_id], (err, results) => {
//         if (err) {
//           console.log(err);
//         }
//       });
//     } catch (error) {}
//   });

//   res.status(StatusCodes.OK).json({ msg: "record edited" });
// });

// Edit module
router.post("/api/admin/editModule/:project_id", (req, res) => {
  const { project_id } = req.params;
  const { module_name} = req.body;
  console.log("{ project_id, module_name }", project_id, module_name);
  const updates = module_name.filter((item) => item.module_id);
  const creates = module_name.filter((item) => !item.module_id);
  console.log("updates", updates);
  console.log("creates", creates);

  updates.forEach((module) => {
    if (module.to_date < module.from_date) {
      return res.status(400).send("Invalid date range: to_date should be greater than or equal to from_date");
    }
    try {
      const query =
        "UPDATE module_master SET module_name=?, to_date=?, from_date=?, project_id=? WHERE module_id=?";
      connection.query(
        query,
        [module.item, module.to_date, module.from_date,project_id, module.module_id],
        (err, results) => {
          if (err) {
            console.log("error");
          }
        }
      );
    } catch (error) {}
  });
  creates.forEach((module) => {
    if (module.to_date < module.from_date) {
      return res.status(400).send("Invalid date range: to_date should be greater than or equal to from_date");
    }
    try {
      const query =
        "INSERT INTO module_master (module_name, to_date, from_date, project_id) VALUES (?, ?, ?, ?)";
      connection.query(
        query,
        [module.item, module.to_date, module.from_date, project_id],
        (err, results) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

  res.status(StatusCodes.OK).json({ msg: "record edited" });
});

// delete module
router.delete("/api/admin/deleteModule/:project_id", (req, res) => {
  const { project_id } = req.params;

  // Check if the module is assigned to any employee
  const checkQuery =
    "SELECT COUNT(*) as count FROM module_master WHERE project_id = ?";
  connection.query(checkQuery, [project_id], (checkErr, checkResults) => {
    if (checkErr) throw checkErr;

    if (checkResults[0].count === 0) {
      res.status(400).send({
        error: "Module cannot be deleted as project not found",
      });
    } else {
      const deleteQuery = "DELETE FROM module_master WHERE project_id = ?";
      connection.query(
        deleteQuery,
        [project_id],
        (deleteErr, deleteResults) => {
          if (deleteErr) throw deleteErr;
          res.status(200).send("Module Deleted Successfully");
        }
      );
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
