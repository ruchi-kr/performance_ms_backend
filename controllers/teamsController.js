const { StatusCodes } = require("http-status-codes");
const connection = require("../db");



const GetAllTeams = async (req, res) => {
  const { reporting_manager_id } = req.params;
  console.log("reporting manager", reporting_manager_id);
  try {
    const query =
      "SELECT * FROM team INNER JOIN project_master on team.project_id = project_master.project_id WHERE reporting_manager_id=?";
    connection.query(query, reporting_manager_id, (err, results) => {
      if (err) throw err;
      temp = JSON.parse(JSON.stringify(results));
      console.log("data", temp);
      for (index in temp) {
        console.log(temp[index].employee_id);
        const teamArray = JSON.parse(temp[index].employee_id);
        temp[index].employee_id = teamArray;
        console.log("teamArrya", typeof teamArray);
      }
      return res.status(StatusCodes.OK).json({ data: temp });
    });
  } catch (error) {
    console.log("error", error);
  }
};
const GetTeam = async (req, res) => {
  const { team_id } = req.params;

  try {
    const query = "SELECT * FROM team WHERE team_id=?";
    connection.query(query, [team_id], (err, results) => {
      if (err) throw err;
      temp = JSON.parse(JSON.stringify(results));
      console.log("data", results);
      for (index in temp) {
        console.log(temp[index].employee_id);
        const teamArray = JSON.parse(temp[index].employee_id);
        temp[index].employee_id = teamArray;
        console.log("teamArrya", typeof teamArray);
      }
      return res.status(StatusCodes.OK).json({ data: temp });
    });
  } catch (error) {
    console.log("error", error);
  }
};
const AddTeam = async (req, res) => {
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
const EditTeam = async (req, res) => {
  const { team_id } = req.params;
  const { project_id, employee_id, reporting_manager_id } = req.body;
  console.clear();
  console.log(
    "team_id project_id, employee_id, reporting_manager_id",
    team_id,
    project_id,
    JSON.stringify(employee_id),
    reporting_manager_id
  );

  const query =
    "UPDATE team SET project_id=?, employee_id =?, reporting_manager_id=? WHERE team_id=?";
  connection.query(
    query,
    [project_id, JSON.stringify(employee_id), reporting_manager_id, team_id],
    (err, result) => {
      // if (result.affectedRows === 0) {
      //   return res
      //     .status(StatusCodes.BAD_REQUEST)
      //     .json({ msg: "failed to modify record" });
      // }
      if (err) {
        console.log(err);
        return res
          .status(StatusCodes.NO_CONTENT)
          .json({ msg: "data falied modify record" });
      } else {
        res.status(StatusCodes.NO_CONTENT).json({ msg: "record modified" });
      }
    }
  );
};
const DeleteTeam = async (req, res) => {
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


module.exports = { GetAllTeams, GetTeam, AddTeam, EditTeam, DeleteTeam };
