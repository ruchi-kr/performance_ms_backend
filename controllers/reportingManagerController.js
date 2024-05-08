const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const GetReportingManagerForEmployee = async (req, res) => {
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

const GetDailyReportToManagerPerEmployee = async (req, res) => {
  const { manager_id, employee_id, project_id } = req.params;
  const { search } = req.query;
  console.log("search term", search);

  console.log(
    "manager_id,employee_id,project_id",
    manager_id,
    employee_id,
    project_id
  );
  try {
    let query = "";
    if (employee_id === "null" || employee_id === null) {
      console.log("running all employees query with particular project");
      query = `SELECT e.*, pm.project_name,em.*,mm.* FROM employee as e LEFT JOIN project_master AS pm ON e.project_id=pm.project_id LEFT JOIN employee_master AS em ON e.employee_id=em.employee_id LEFT JOIN module_master as mm ON e.module_id = mm.module_id  WHERE e.manager_id=? AND e.project_id=?  AND (DATE(created_at)<=CURRENT_DATE() OR e.status='inprocess' OR e.status='notstarted' )`;
      connection.query(query, [manager_id, project_id], (err, results) => {
        if (err) throw err;
        temp = JSON.parse(JSON.stringify(results));
        // console.log("data", temp);

        return res.status(StatusCodes.OK).json({ data: temp });
      });
    } else if (project_id === "null" || project_id === null) {
      console.log("running particular employees query");
      query =
        "SELECT e.*, pm.project_name,em.* FROM employee as e LEFT JOIN project_master AS pm ON e.project_id=pm.project_id LEFT JOIN employee_master AS em ON e.employee_id=em.employee_id WHERE e.manager_id=? AND e.employee_id = ? AND ((DATE(e.created_at)=CURRENT_DATE() OR e.status = 'inprocess' OR e.status = 'notstarted') OR (DATE(e.actual_end_date)=CURRENT_DATE() AND e.status = 'completed'))";
      connection.query(query, [manager_id, employee_id], (err, results) => {
        if (err) throw err;
        temp = JSON.parse(JSON.stringify(results));
        // console.log("data", temp);

        return res.status(StatusCodes.OK).json({ data: temp });
      });
    }
    console.log("query", query);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong!" });
  }
  // res
  //   .status(StatusCodes.OK)
  //   .json({ msg: "daily emplopyee report per employee" });
};

module.exports = {
  GetReportingManagerForEmployee,
  GetDailyReportToManagerPerEmployee,
};
