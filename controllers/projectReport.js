const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const ViewProjectReport = (req, res) => {
  const { reporting_manager_id } = req.params;
  console.log("reporting manager id", reporting_manager_id);

  try {
    const query =
      "SELECT * FROM team LEFT JOIN project_master on team.project_id = project_master.project_id WHERE reporting_manager_id=?";
    connection.query(query, reporting_manager_id, (err, results) => {
      if (err) throw err;
      console.log("***********************", results);
      temp = JSON.parse(JSON.stringify(results));
      for (index in temp) {
        console.log(temp[index].employee_id);

        const teamArray = JSON.parse(temp[index].employee_id);
        temp[index].employee_id = teamArray;
        console.log("teamArrya", typeof teamArray);
        // try {
        //   connection.query(
        //     query,
        //     temp.reporting_manager_id,
        //     temp.project_id,
        //     (err, results) => {
        //       console.log(
        //         "\n\n\n\n================actual start date========================",
        //         results
        //       );
        //     }
        //   );
        // } catch (error) {
        //   console.log("error");
        // }
      }
      const resultsArray = [];
      const queryPromises = temp.map((obj) => {
        const { team_id, project_id, employee_id } = obj;
        console.log(
          "{ team_id, project_id, employee_id },reporting_manager_id",
          {
            team_id,
            project_id,
            employee_id,
          },
          reporting_manager_id
        );
        const employeeResults = [];
        const employeeQueryPromises = employee_id.map((id) => {
          console.log("employee id query", id);
          return new Promise((resolve, reject) => {
            const query = `SELECT e.employee_id,e.manager_id,e.project_id,e.actual_time,e.allocated_time,e.status,SUM(allocated_time) AS total_allocated_time, SUM(actual_time) AS total_actual_time,em.name,pm.project_name,pm.schedule_start_date,schedule_end_date FROM employee AS e LEFT JOIN employee_master AS em ON e.employee_id=em.employee_id LEFT JOIN project_master AS pm ON e.project_id = pm.project_id WHERE e.project_id=? AND e.employee_id=? AND e.manager_id=?`;
            connection.query(
              query,
              [project_id, id, reporting_manager_id],
              (err, results) => {
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  results = JSON.parse(JSON.stringify(results));
                  //   employeeResults.push(results);
                  resolve(results);
                }
              }
            );
          });
        });
        // resultsArray.push(employeeResults);
        return Promise.all(employeeQueryPromises);
      });

      Promise.all(queryPromises)
        .then((resultsArray) => {
          console.log("************************results array", resultsArray);
          // Transforming the results into the desired format [[{},{}],[{},{}]]
          const formattedResults = resultsArray.map((teamResults) => {
            return teamResults.map((employeeResult) => {
              return employeeResult[0]; // Assuming each employee result is an array of length 1
            });
          });
          // Inserting the results back into the temp array
          temp.forEach((team, index) => {
            team.report = formattedResults[index];
          });

          return res.status(StatusCodes.OK).json(temp);
        })
        .catch((error) => {
          console.log(error);
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Internal Server Error" });
        });
    });
  } catch (error) {
    console.log("error", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};

const ProjectActualStartDate = (req, res) => {
  const { reporting_manager_id } = req.params;
  console.log("reporting manager id", reporting_manager_id);
  try {
    const query = `SELECT e.project_id,
      MIN(e.created_at) AS actual_start_date
  FROM
      employee e
  GROUP BY
      e.project_id`;
    connection.query(
      query,
      reporting_manager_id,

      (err, results) => {
        console.log(
          "\n\n\n\n================actual start date========================",
          results
        );

        res.status(StatusCodes.OK).json(results);
      }
    );
  } catch (error) {
    console.log("error");
  }
};

// const ProjectActualStartDate = (req,res)=>{
//     res.send("OK")
// }
module.exports = { ViewProjectReport, ProjectActualStartDate };
