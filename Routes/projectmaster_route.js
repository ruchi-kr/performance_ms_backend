const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const protectedRoute = require("../middleware/protectedResource");
const connection = require("../db");
const asyncConnection = require("../db2");
const { StatusCodes } = require("http-status-codes");
// API FOR PROJECT CRUD

// CREATE project
router.post("/api/admin/addProject", protectedRoute, (req, res) => {
  const { project_name, schedule_start_date, schedule_end_date, stage } =
    req.body;

  // Check if schedule_end_date is greater than schedule_start_date
  if (schedule_end_date <= schedule_start_date) {
    return res
      .status(400)
      .json({ error: "End date should be greater than start date." });
  }
  const query =
    "INSERT INTO project_master ( project_name, schedule_start_date,schedule_end_date,stage) VALUES (?, ?, ?,?)";
  connection.query(
    query,
    [project_name, schedule_start_date, schedule_end_date, stage],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        res.status(200).send("Project Added Successfully");
      }
    }
  );
});

// // Get project
// router.get('/api/admin/getProjects', (req, res) => {

//     const query = 'SELECT * FROM project_master';
//     connection.query(query,(err, results) => {
//       if (err) throw err;
//       res.status(200).json(results);
//     });
//   });

// Get project
// with pagination
router.get("/api/admin/getallProject", (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    name = "",
    sortBy = "project_name",
    sortOrder = "ASC",
  } = req.query;

  const offset = Number((page - 1) * pageSize);
  const query = `SELECT * FROM project_master WHERE project_name LIKE ?  ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  let totalCount = 0;
  let totalPages = 0;
  let projects;
  connection.query(
    query,
    [`%${name}%`, Number(pageSize), offset],
    (err, results) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        projects=results;
        connection.query(
          `SELECT COUNT(*) AS total FROM project_master WHERE project_name LIKE '%${name}%';`,
          [`${name}`],
          (err, results) => {
            if (err) console.log(err);

            results = JSON.parse(JSON.stringify(results));
            totalCount = results[0].total;
            totalPages = Math.ceil(totalCount / pageSize);

            res.status(200).json({
              data: projects,
              pagination: {
                totalRecords: totalCount,
                pageSize: Number(pageSize),
                totalPages,
                currentPage: Number(page),
                nextPage: Number(page) < totalPages ? Number(page) + 1 : null,
                prevPage: Number(page) > 1 ? Number(page) - 1 : null,
              },
            });
          }
        );
      }
    }
  );
});
// without pagination
router.get("/api/admin/getProjects", (req, res) => {
  // const query = 'SELECT * FROM project_master ';
  try {
    const query =
      "SELECT pm.*,t.team_id,t.employee_id,t.reporting_manager_id,em.name FROM project_master AS pm LEFT JOIN team AS t ON pm.project_id=t.project_id LEFT JOIN employee_master AS em ON t.reporting_manager_id=em.employee_id";
    connection.query(query, (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/api/admin/getProjects/:project_id", async (req, res) => {
  try {
    const projectId = req.params.project_id;
    const query = "SELECT * FROM project_master WHERE project_id=?";
    connection.query(query, [projectId], (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ error: "Error fetching project details" });
  }
});

// Edit project
router.post(
  "/api/admin/editProject/:project_id",
  protectedRoute,
  async (req, res) => {
    const { project_id } = req.params;
    const {
      project_name,
      schedule_start_date,
      schedule_end_date,
      stage,
      module_id,
    } = req.body;

    if (schedule_end_date <= schedule_start_date) {
      return res
        .status(400)
        .json({ error: "End date should be greater than start date." });
    }
    const updateQuery =
      "UPDATE project_master SET project_name=?, schedule_start_date =?, schedule_end_date=?, stage=?, module_id=? WHERE 	project_id=?";

    const [projectDetails] = await asyncConnection.query(
      "SELECT * FROM project_master WHERE project_id = ?",
      project_id
    );
    let newConnection;
    const projectStage = projectDetails[0].stage;

    try {
      newConnection = await asyncConnection.getConnection();

      // Begin transaction
      await newConnection.beginTransaction();

      if (projectStage === "rfp" && stage === "won") {
        console.log("replicating data from rfp ----> won");
        //check if transition happened already

        const [oldModules] = await asyncConnection.query(
          "SELECT * from module_master WHERE project_id = ? AND stage NOT LIKE 'scrapped'",
          project_id
        );
        console.log("old modules", oldModules);

        await duplicateModuleAndTasksRfpToWon(newConnection, project_id, "won");
      } else if (projectStage === "won" && stage === "inprocess") {
        console.log("replicating data from won ----> inprocess");
        await duplicateModuleAndTasksWonToInprocess(
          newConnection,
          project_id,
          "inprocess"
        );
      }
      await newConnection.query(updateQuery, [
        project_name,
        schedule_start_date,
        schedule_end_date,
        stage,
        module_id,
        project_id,
      ]);
      // Commit transaction
      await newConnection.commit();

      return res
        .status(StatusCodes.OK)
        .json({ msg: "record modified successfully!" });
    } catch (error) {
      console.error("Error changing stage:", error);
      if (newConnection) {
        await newConnection.rollback();
      }
      res.status(500).json({ error: "Internal server error." });
    } finally {
      if (newConnection) {
        newConnection.release();
      }
    }
  }
);

// Edit project old
// router.post(
//   "/api/admin/editProject/:project_id",
//   protectedRoute,
//   (req, res) => {
//     const projectId = req.params.project_id;

//     const fetchQuery = "SELECT * FROM project_master WHERE project_id=?";
//     const updateQuery =
//       "UPDATE project_master SET project_name=?, schedule_start_date =?, schedule_end_date=?, stage=?, module_id=? WHERE 	project_id=?";

//     // Fetch project by ID
//     connection.query(fetchQuery, [projectId], (fetchErr, fetchResults) => {
//       if (fetchErr) {
//         return res.status(500).send("Error fetching project data");
//       }

//       if (fetchResults.length === 0) {
//         return res.status(404).send("Project not found");
//       }

//       const existingProject = fetchResults[0];
//       const { project_name, schedule_start_date, schedule_end_date,stage,module_id } = req.body;

//       // Update project data
//       connection.query(
//         updateQuery,
//         [project_name, schedule_start_date, schedule_end_date, stage,module_id,projectId],
//         (updateErr, updateResults) => {
//           if (updateErr) {
//             return res.status(500).send("Error updating project");
//           }

//           // Fetch updated project data
//           connection.query(
//             fetchQuery,
//             [projectId],
//             (fetchUpdatedErr, fetchUpdatedResults) => {
//               if (fetchUpdatedErr) {
//                 return res
//                   .status(500)
//                   .send("Error fetching updated project data");
//               }

//               const updatedProject = fetchUpdatedResults[0];
//               if (updatedProject) {
//                 res.status(200).json(updatedProject); // Return updated project data
//               } else {
//                 res.status(500).send("Failed to fetch updated project data"); // Handle case where updated project data is not found
//               }
//             }
//           );
//         }
//       );
//     });
//   }
// );
// DELETE project
router.delete(
  "/api/admin/deleteProject/:project_id",
  protectedRoute,
  (req, res) => {
    const ProjectId = req.params.project_id;
    const query = "DELETE FROM project_master WHERE project_id=?";
    connection.query(query, [ProjectId], (err, results) => {
      console.log("delete project results", results);
      if (err) {
        console.log(err);
        if (err.errno === 1451) {
          return res
            .status(500)
            .json({ error: "First delete modules of this project" });
        }
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        res.status(200).send({msg: "Project deleted successfully"});
      }
    });
  }
);

// no.of projects
// router.get('/api/getDashData', (req, res) => {
//   connection.query('SELECT COUNT(*) AS projectCount FROM project_master', (error, results) => {
//     if (error) {
//       console.error('Error fetching project count:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }
//     const projectCount = results[0].projectCount;
//     res.status(200).json({ projectCount });
//   });
// });

// router.get("/api/getDashData", (req, res) => {
//   const queries = [
//     "SELECT COUNT(*) AS projectCount FROM project_master",
//     "SELECT COUNT(*) AS employeeCount FROM employee_master",
//     "SELECT COUNT(*) AS userCount FROM user_master",
//     "SELECT COUNT(*) AS reportingManagerCount FROM reporting_manager_master",
//   ];

//   connection.query(queries, (error, results) => {
//     if (error) {
//       console.error("Error fetching data:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }

//     const [
//       projectCountResult,
//       employeeCountResult,
//       userCountResult,
//       reportingManagerCountResult,
//     ] = results;

//     const projectCount = projectCountResult[0].projectCount;
//     const employeeCount = employeeCountResult[0].employeeCount;
//     const userCount = userCountResult[0].userCount;
//     const reportingManagerCount =
//       reportingManagerCountResult[0].reportingManagerCount;

//     res
//       .status(200)
//       .json({ projectCount, employeeCount, userCount, reportingManagerCount });
//   });
// });

// to export to excel and pdf file
router.get("/api/admin/getexcelpdfprojects", (req, res) => {
  try {
    const query = "SELECT * FROM project_master";
    connection.query(query, (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// Function to duplicate module and task data rfp to won
async function duplicateModuleAndTasksRfpToWon(
  newConnection,
  project_id,
  newStage
) {
  try {
    // Fetch all modules associated with the project and stage not like 'scrapped', with row-level locking
    const [modules] = await newConnection.query(
      `
     SELECT module_id, module_name, from_date, to_date,status                                                
     FROM module_master
     WHERE project_id = ? AND status NOT LIKE 'scrapped' AND stage LIKE 'rfp' 
     FOR UPDATE;
   `,
      [project_id]
    );
    console.log("modules from rfp->won", modules);
    for (const module of modules) {
      // Insert new module
      const [result] = await newConnection.query(
        `
      INSERT INTO module_master (project_id, module_name, from_date, to_date, stage,status)
      VALUES (?, ?, ?, ?, ?,?);
    `,
        [
          project_id,
          module.module_name,
          module.from_date,
          module.to_date,
          newStage,
          module.status,
        ]
      );

      // Get the ID of the newly inserted module
      const newModuleId = result.insertId;
      console.log("insert_id", newModuleId);

      // Replicate tasks for the newly inserted module with row-level locking
      await newConnection.query(
        `
      INSERT INTO task_master (module_id, task_name,allocated_time,stage)
      SELECT ? AS module_id, task_name,allocated_time,?
      FROM task_master
      WHERE module_id = ?
      FOR UPDATE;
    `,
        [newModuleId, newStage, module.module_id]
      );

      console.log("Data duplicated successfully.");
    }
  } catch (error) {
    console.error("Error duplicating module and task data:", error);
    // Rollback transaction on error
    await newConnection.rollback();
    throw error;
  }
}
// Function to duplicate module and task data won to inprocess
async function duplicateModuleAndTasksWonToInprocess(
  newConnection,
  project_id,
  newStage
) {
  try {
    // Fetch all modules associated with the project and stage not like 'scrapped', with row-level locking
    const [modules] = await newConnection.query(
      `
     SELECT module_id, module_name, from_date, to_date,status
     FROM module_master
     WHERE project_id = ? AND status NOT LIKE 'scrapped' AND stage LIKE 'won'
     FOR UPDATE;
   `,
      [project_id]
    );
    console.log("modules--->", modules);

    for (const module of modules) {
      // Insert new module
      const [result] = await newConnection.query(
        `
      INSERT INTO module_master (project_id, module_name, from_date, to_date, stage,status)
      VALUES (?, ?, ?, ?, ?,?);
    `,
        [
          project_id,
          module.module_name,
          module.from_date,
          module.to_date,
          newStage,
          module.status,
        ]
      );

      // Get the ID of the newly inserted module
      const newModuleId = result.insertId;
      console.log("insert_id", newModuleId);

      // Replicate tasks for the newly inserted module with row-level locking
      await newConnection.query(
        `
      INSERT INTO task_master (module_id, task_name,allocated_time,stage)
      SELECT ? AS module_id, task_name,allocated_time,?
      FROM task_master
      WHERE module_id = ?
      FOR UPDATE;
    `,
        [newModuleId, newStage, module.module_id]
      );

      console.log("Data duplicated successfully.");
    }
  } catch (error) {
    console.error("Error duplicating module and task data:", error);
    // Rollback transaction on error
    await newConnection.rollback();
    throw error;
  }
}

module.exports = router;
