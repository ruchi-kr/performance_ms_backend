const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const GetProjectPlan = async (req, res) => {
  let {
    search = "",
    page = 1,
    pageSize = 10,
    sortBy = "module_name",
    sortOrder = "ASC",
  } = req.query;
  const { project_id } = req.params;
  console.log("projetc_id", project_id);
  const offset = (Number(page) - 1) * Number(pageSize);
  const paginatedQuery = `SELECT 
  stage,
  CONCAT('[', GROUP_CONCAT(
      JSON_OBJECT(
          'module_id', module_id,
          'project_id', project_id,
          'module_name', module_name,
          'to_date', to_date,
          'from_date', from_date,
          'status', status,
          'stage',stage,
          'tasks', tasks
      )
  SEPARATOR ', '), ']') AS modules
FROM (
  SELECT 
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
              'stage',t.stage,
              'allocated_time', t.allocated_time
          )
      SEPARATOR ', '), ']') AS tasks
  FROM 
      module_master m
  LEFT JOIN 
      task_master t ON m.module_id = t.module_id
  WHERE 
      m.project_id = ?
  GROUP BY 
      m.module_id
) AS subquery
GROUP BY 
  stage`;

  let projectDetails = [];
  const projectQuery = "SELECT * FROM project_master WHERE project_id=?";
  try {
    connection.query(projectQuery, [project_id], (err, results) => {
      if (err) console.log(err);
      projectDetails = results;
      // results =(results);
      console.log(results[0]);
    });
  } catch (error) {
    console.log(error);
  }

  connection.query(paginatedQuery, [project_id], (err, results) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    } else {
      results = results.map((item) => {
        return {
          ...item,
          modules: JSON.parse(item.modules),
        };
      });
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
            project: projectDetails,
            plan: results,
            // pagination: {
            //   totalRecords: totalCount,
            //   pageSize: Number(pageSize),
            //   totalPages,
            //   currentPage: Number(page),
            //   nextPage: Number(page) < totalPages ? Number(page) + 1 : null,
            //   prevPage: Number(page) > 1 ? Number(page) - 1 : null,
            // },
          });
        }
      });
    }
  });
};
const GetLatestProjectPlan = async (req, res) => {
  res
    .status(StatusCodes.OK)
    .json({ msg: "get latest PROjectplan ie last plan added" });
};
const AddProjectPlan = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "aDD PROjectplan" });
};
const EditProjectPlan = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "edit PROjectplan" });
};

module.exports = {
  GetProjectPlan,
  AddProjectPlan,
  GetLatestProjectPlan,
  EditProjectPlan,
};
