const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");
const { StatusCodes } = require("http-status-codes");

// API FOR Module Master CRUD
// CREATE module
router.post("/api/admin/addModule", (req, res) => {
  const { module_name, project_id, from_date, to_date, status, stage } =
    req.body;
  console.log("{ module_name, project_id, from_date, to_date, status,stage }", {
    module_name,
    project_id,
    from_date,
    to_date,
    status,
    stage,
  });
  // const module_array = JSON.stringify(module_name.map((module) => module.item));
  // const module_array = JSON.stringify(
  //   module_name.map((module) => ({
  //     item: module.item,
  //     to_date: module.to_date,
  //     from_date: module.from_date,
  //   }))
  // );
  // console.log("module_array", module_array);
  // module_name.forEach((module) => {
  //   if (module.to_date < module.from_date) {
  //     res
  //       .status(400)
  //       .send(
  //         "Invalid date range: to_date should be greater than or equal to from_date"
  //       );
  //     return; // Exit the loop if the condition is not met
  //   }

  //   const query =
  //     "INSERT INTO module_master ( module_name,to_date,from_date,project_id) VALUES (?,?,?,?)";
  //   connection.query(
  //     query,
  //     [module.item, module.to_date, module.from_date, project_id],
  //     (err, results) => {
  //       if (err) {
  //         console.log(err);
  //         res.status(500).json({
  //           error: "An error occurred while processing your request.",
  //         });
  //       }
  //     }
  //   );
  // });
  const query =
    "INSERT INTO module_master ( module_name,to_date,from_date,project_id,status,stage) VALUES (?,?,?,?,?,?)";
  connection.query(
    query,
    [module_name, to_date, from_date, project_id, status, stage],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({
          error: "An error occurred while processing your request.",
        });
      }
    }
  );
  res.status(200).send("Module Added Successfully");
});

// Get Module
router.get("/api/admin/getAllModule/:project_id", (req, res) => {
  let {
    search,
    page = 1,
    pageSize = 10,
    sortBy = "module_name",
    sortOrder = "ASC",
  } = req.query;
  console.log("search term", search);
  const { project_id } = req.params;
  const offset = (Number(page) - 1) * Number(pageSize);
  console.log("search term", search);
  // Query to fetch paginated results
  const paginatedQuery = `SELECT 
  m.module_id,
  m.project_id,
  m.module_name,
  m.to_date,
  m.from_date,
  m.status,
  m.stage,
  CONCAT('[', GROUP_CONCAT(
      JSON_OBJECT(
          'task_id', t.task_id,
          'task_name', t.task_name,
          'allocated_time', t.allocated_time,
          'module_id',t.module_id
      )
  ), ']') AS tasks
FROM 
  module_master m
LEFT JOIN 
  task_master t ON m.module_id = t.module_id
WHERE 
  m.project_id = ?
AND
  m.module_name LIKE ? 
AND 
  m.stage LIKE ?
GROUP BY 
  m.module_id
`;
  let projectStage = "";
  try {
    connection.query(
      "SELECT * FROM project_master where project_id = ?",
      project_id,
      (error, results) => {
        if (error) console.log(error);
        results = JSON.parse(JSON.stringify(results));
        console.log(results[0]);
        projectStage = results[0].stage;
        console.log("project stage", projectStage);

        connection.query(
          paginatedQuery,
          [
            project_id,
            `%${search}%`,
            projectStage,
            Number(pageSize),
            offset,
          ],
          (err, results) => {
            if (err) {
              console.log(err);
              res
                .status(500)
                .json({
                  error: "An error occurred while processing your request.",
                });
            } else {
              // Query to fetch total count of records
              const totalCountQuery =
                "SELECT COUNT(*) AS totalRecords FROM module_master";
              connection.query(totalCountQuery, (err, totalCountResult) => {
                if (err) {
                  console.log(err);
                  res.status(500).json({
                    error: "An error occurred while processing your request.",
                  });
                } else {
                  const totalCount = totalCountResult[0].totalRecords;
                  const totalPages = Math.ceil(totalCount / Number(pageSize));
                  const temp = results.map((module) => {
                    return {
                      ...module,
                      tasks: JSON.parse(module.tasks),
                    };
                  });
                  res.status(200).send({
                    data: temp,
                    pagination: {
                      totalRecords: totalCount,
                      pageSize: Number(pageSize),
                      totalPages,
                      currentPage: Number(page),
                      nextPage:
                        Number(page) < totalPages ? Number(page) + 1 : null,
                      prevPage: Number(page) > 1 ? Number(page) - 1 : null,
                    },
                  });
                }
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal server error" });
  }
});

// Get Module for project
router.get("/api/admin/getModule/:project_id", (req, res) => {
  const { project_id } = req.params;
  console.log("params", project_id);
  let {
    search,
    page = 1,
    pageSize = 10,
    sortBy = "module_name",
    sortOrder = "ASC",
  } = req.query;
  console.log("search term", search);
  const offset = (Number(page) - 1) * Number(pageSize);

  // Query to fetch paginated results
  const paginatedQuery =
    "SELECT * FROM module_master AS mm WHERE mm.module_name LIKE ? AND mm.project_id=? LIMIT ? OFFSET ?";
  connection.query(
    paginatedQuery,
    [`%${search}%`, project_id, Number(pageSize), offset],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        // Query to fetch total count of records
        const totalCountQuery =
          "SELECT COUNT(*) AS totalRecords FROM module_master";
        connection.query(totalCountQuery, (err, totalCountResult) => {
          if (err) {
            console.log(err);
            res.status(500).json({
              error: "An error occurred while processing your request.",
            });
          } else {
            const totalCount = totalCountResult[0].totalRecords;
            const totalPages = Math.ceil(totalCount / Number(pageSize));
            res.status(200).send({
              results,
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
        });
      }
    }
  );
});

// Edit module
router.patch("/api/admin/editModule/:module_id", (req, res) => {
  const { module_id } = req.params;

  const { project_id, module_name, from_date, to_date, status } = req.body;
  console.log("{ project_id, module_name, from_date, to_date, status }", {
    project_id,
    module_name,
    from_date,
    to_date,
    status,
  });
  const query =
    "UPDATE module_master SET project_id=?,module_name=?,from_date=?,to_date=?,status=? WHERE module_id=? ";
  try {
    connection.query(
      query,
      [project_id, module_name, from_date, to_date, status, module_id],
      (err, results) => {
        if (err) console.log(err);
      }
    );
  } catch (error) {
    return res.status(StatusCodes.OK).json({ msg: "Record not edited" });
  }

  res.status(StatusCodes.OK).json({ msg: "record edited" });
});

// Edit module
// router.post("/api/admin/editModule/:project_id", (req, res) => {
//   const { project_id } = req.params;
//   const { module_name } = req.body;
//   console.log("{ project_id, module_name }", project_id, module_name);

//   const updates = module_name.filter((item) => item.module_id);
//   const creates = module_name.filter((item) => !item.module_id);
//   console.log("updates", updates);
//   console.log("creates", creates);

//   // Extracting module IDs from the array of objects
//   const moduleIdsToNotDelete = updates.map((module) => module.module_id);

//   const sql = `DELETE FROM module_master WHERE module_id NOT IN (?) AND project_id=?`;
//   // Execute the query
//   connection.query(sql, [moduleIdsToNotDelete, project_id], (err, result) => {
//     if (err) {
//       console.error("Error deleting modules:", err);
//     }
//     console.log("Modules deleted successfully");
//   });

//   console.log("ids to not delete", moduleIdsToNotDelete);
//   updates.forEach((module) => {
//     if (module.to_date < module.from_date) {
//       return res
//         .status(400)
//         .send(
//           "Invalid date range: to_date should be greater than or equal to from_date"
//         );
//     }
//     try {
//       const query =
//         "UPDATE module_master SET module_name=?, to_date=?, from_date=?, project_id=? WHERE module_id=?";
//       connection.query(
//         query,
//         [
//           module.item,
//           module.to_date,
//           module.from_date,
//           project_id,
//           module.module_id,
//         ],
//         (err, results) => {
//           if (err) {
//             console.log("error");
//           }
//         }
//       );
//     } catch (error) {}
//   });
//   creates.forEach((module) => {
//     if (module.to_date < module.from_date) {
//       return res
//         .status(400)
//         .send(
//           "Invalid date range: to_date should be greater than or equal to from_date"
//         );
//     }
//     try {
//       const query =
//         "INSERT INTO module_master (module_name, to_date, from_date, project_id) VALUES (?, ?, ?, ?)";
//       connection.query(
//         query,
//         [module.item, module.to_date, module.from_date, project_id],
//         (err, results) => {
//           if (err) {
//             console.log(err);
//           }
//         }
//       );
//     } catch (error) {
//       console.log(error);
//     }
//   });

//   res.status(StatusCodes.OK).json({ msg: "record edited" });
// });

// delete module
router.delete("/api/admin/deleteModule/:module_id", (req, res) => {
  const { module_id } = req.params;

  // Check if the module is assigned to any employee
  const deleteQuery = "DELETE FROM module_master WHERE module_id = ?";
  connection.query(deleteQuery, [module_id], (deleteErr, deleteResults) => {
    if (deleteErr){
      console.log(deleteErr);
      if(deleteErr.errno === 1451){
        res.status(500).json({ msg: "First delete the tasks associated with this module." });
      }
      res.status(500).json({ msg: "Error while deleting module" });
    } 
   
    res.status(200).json({ msg: "Module Deleted Successfully" });
  });
});


module.exports = router;
