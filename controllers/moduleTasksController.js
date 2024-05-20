const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const GetAllModuleTasks = async (req, res) => {
  let {
    search = "",
    page = 1,
    pageSize = 10,
    sortBy = "module_name",
    sortOrder = "ASC",
  } = req.query;
  const { project_id } = req.query;

  const offset = (Number(page) - 1) * Number(pageSize);
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
            'allocated_time', t.allocated_time
        )
    ), ']') AS tasks
FROM 
    module_master m
LEFT JOIN 
    task_master t ON m.module_id = t.module_id
WHERE 
    m.project_id = ?
GROUP BY 
    m.module_id;`;
  connection.query(paginatedQuery, [project_id], (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      // Query to fetch total count of records
      const totalCountQuery =
        "SELECT COUNT(*) AS totalRecords FROM task_master";
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
  });
  // const query = "SELECT * from task_master";
  // connection.query(query, (err, results) => {
  //   return res.status(StatusCodes.OK).json(results);
  // });
};
const GetModuleTasks = async (req, res) => {
  const { module_id } = req.params;
  console.log("module_id", module_id);
  let {
    search = "",
    page = 1,
    pageSize = 10,
    sortBy = "module_name",
    sortOrder = "ASC",
  } = req.query;

  const offset = (Number(page) - 1) * Number(pageSize);
  const paginatedQuery =
    "SELECT * FROM task_master WHERE task_name LIKE ? AND module_id = ? LIMIT ? OFFSET ?";
  connection.query(
    paginatedQuery,
    [`%${search}%`, module_id, Number(pageSize), offset],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        // Query to fetch total count of records
        const totalCountQuery =
          "SELECT COUNT(*) AS totalRecords FROM task_master";
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
  // const query = "SELECT * from task_master";
  // connection.query(query, (err, results) => {
  //   return res.status(StatusCodes.OK).json(results);
  // });
};

const AddModuleTasks = async (req, res) => {
  const {
    module_id,
    task_name,
    allocated_time,
    stage,
    fullstack,
    frontend,
    backend,
    design,
    qa,
    pm,
    special,
  } = req.body;

  console.log("{ module_name, project_id, from_date, to_date, status,stage }", {
    module_id,
    task_name,
    allocated_time,
    stage,
    fullstack,
    frontend,
    backend,
    design,
    qa,
    pm,
    special,
  });

  const query =
    "INSERT INTO task_master ( module_id,task_name,allocated_time,stage,fullstack_count,fullstack_days,frontend_count,frontend_days,backend_count,backend_days,design_count,design_days,qa_count,qa_days,pm_count,pm_days,special_count,special_days) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  connection.query(
    query,
    [
      module_id,
      task_name,
      allocated_time,
      stage,
      fullstack.count,
      fullstack.days,
      frontend.count,
      frontend.days,
      backend.count,
      backend.days,
      design.count,
      design.days,
      qa.count,
      qa.days,
      pm.count,
      pm.days,
      special.count,
      special.days,
    ],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: "An error occurred while processing your request.",
        });
      }
      return res.status(StatusCodes.OK).json(results);
    }
  );
};
const EditModuleTask = async (req, res) => {
  const { task_id } = req.params;
  console.log("route accessed");
  const {
    module_id,
    task_name,
    allocated_time,
    fullstack,
    frontend,
    backend,
    design,
    qa,
    pm,
    special,
  } = req.body;

  const query =
    "UPDATE task_master SET module_id=?,task_name=?,allocated_time=? fullstack_count=?,fullstack_days=?,frontend_count=?,frontend_days=?,backend_count=?,backend_days=?,design_count=?,design_days=?,qa_count=?,qa_days=?,pm_count=?,pm_days=?,special_count=?,special_days=? WHERE task_id=? ";
  try {
    connection.query(
      query,
      [
        module_id,
        task_name,
        allocated_time,
        fullstack.count,
        fullstack.days,
        frontend.count,
        frontend.days,
        backend.count,
        backend.days,
        design.count,
        design.days,
        qa.count,
        qa.days,
        pm.count,
        pm.days,
        special.count,
        special.days,
        ,
        task_id,
      ],
      (err, results) => {
        if (err) console.log(err);
      }
    );
  } catch (error) {
    return res.status(StatusCodes.OK).json({ msg: "Record not edited" });
  }

  res.status(StatusCodes.OK).json({ msg: "record edited" });
};

const DeleteModuleTask = async (req, res) => {
  const { task_id } = req.params;
  // Check if the task is assigned to any employee
  const checkQuery = "SELECT COUNT(*) as count FROM employee WHERE task_id = ?";
  connection.query(checkQuery, [task_id], (checkErr, checkResults) => {
    if (checkErr) throw checkErr;

    if (checkResults[0].count > 0) {
      res.status(400).send({
        error: "Task cannot be deleted as it is assigned to an employee",
      });
    } else {
      const deleteQuery = "DELETE FROM task_master WHERE task_id = ?";
      connection.query(deleteQuery, [task_id], (deleteErr, deleteResults) => {
        if (deleteErr) console.log(deleteErr);
        res.status(200).json({ msg: "Task Deleted Successfully" });
      });
    }
  });
};
module.exports = {
  GetAllModuleTasks,
  AddModuleTasks,
  EditModuleTask,
  GetModuleTasks,
  DeleteModuleTask,
};
