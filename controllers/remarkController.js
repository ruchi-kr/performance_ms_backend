const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const AddRemark = async (req, res) => {
  const { reporting_manager_id } = req.params;
  const { project_id, employee_id } = req.body;
  console.log("employee id", employee_id);
  console.log("reporting manager ", reporting_manager_id);
  console.log("project_id", project_id);

  const query =
    "INSERT INTO team ( project_id, employee_id,reporting_manager_id) VALUES (?, ?, ?)";
    connection.query(
      query,
      [project_id, JSON.stringify(employee_id), reporting_manager_id],
      (err, results) => {
        if (err) {
          console.log(err);
          return res
            .status(StatusCodes.NOT_MODIFIED)
            .json({ msg: "data falied added" });
        } else {
          res.status(StatusCodes.OK).json({ msg: "data added" });
        }
      }
    );
  console.log(project_id, employee_id, reporting_manager_id);
};
const EditRemark = async (req, res) => {
  const { task_id } = req.params;
  const { remarks } = req.body;
  console.log("task_id remarks", task_id, remarks);
  const query = "UPDATE employee SET remarks = ? WHERE id = ?";
  connection.query(query, [remarks, task_id], (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Internal server error" });
    } else {
      res.status(200).send("Task remark Updated Successfully");
    }
  });
};
const DeleteRemark = async (req, res) => {
  const { team_id } = req.params;

  const query = "DELETE from team WHERE team_id=?";
  connection.query(query, [team_id], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(StatusCodes.NO_CONTENT)
        .json({ msg: "failed to delete data" });
    }
    // result = JSON.parse(JSON.stringify(result));
    console.log("result", result.affectedRows);
    if (result.affectedRows === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "failed to delete record" });
    }
    res.status(StatusCodes.NO_CONTENT).json({ msg: "record deleted" });
  });
};

module.exports = { AddRemark, EditRemark, DeleteRemark };
