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

  const offset = (Number(page) - 1) * Number(pageSize);
  const paginatedQuery =
    "SELECT * FROM task_master WHERE task_name LIKE ? LIMIT ? OFFSET ?";
  connection.query(
    paginatedQuery,
    [`%${search}%`, Number(pageSize), offset],
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
  const { module_id, task_name, allocated_time, stage } = req.body;
  console.log("{ module_name, project_id, from_date, to_date, status,stage }", {
    module_id,
    task_name,
    allocated_time,
    stage,
  });

  const query =
    "INSERT INTO task_master ( module_id,task_name,allocated_time,stage) VALUES (?,?,?,?)";
  connection.query(
    query,
    [module_id, task_name, allocated_time, stage],
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
  const { module_id, task_name, allocated_time } = req.body;

  const query =
    "UPDATE task_master SET module_id=?,task_name=?,allocated_time=? WHERE task_id=? ";
  try {
    connection.query(
      query,
      [module_id, task_name, allocated_time, task_id],
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

  // Check if the module is assigned to any employee
  const deleteQuery = "DELETE FROM task_master WHERE task_id = ?";
  connection.query(deleteQuery, [task_id], (deleteErr, deleteResults) => {
    if (deleteErr) console.log(deleteErr);
    res.status(200).json({ msg: "Task Deleted Successfully" });
  });
};
module.exports = {
  GetAllModuleTasks,
  AddModuleTasks,
  EditModuleTask,
  GetModuleTasks,
  DeleteModuleTask,
};
