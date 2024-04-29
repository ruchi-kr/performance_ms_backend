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
            const query = `SELECT e.employee_id,e.actual_time,e.allocated_time,e.status,SUM(allocated_time) AS total_allocated_time, SUM(actual_time) AS total_actual_time,em.name FROM employee AS e LEFT JOIN employee_master AS em ON e.employee_id=em.employee_id LEFT JOIN project_master AS pm ON e.project_id = pm.project_id WHERE e.project_id=? AND e.employee_id=? AND e.manager_id=?`;
            connection.query(
              query,
              [project_id, id, reporting_manager_id],
              (err, results) => {
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  results = JSON.parse(JSON.stringify(results));
                  employeeResults.push(results);
                  resolve();
                }
              }
            );
          });
        });
        resultsArray.push(employeeResults);
        return Promise.all(employeeQueryPromises);
      });

      Promise.all(queryPromises)
        .then(() => {
          console.log("************************results array", resultsArray);
          return res.status(StatusCodes.OK).json(resultsArray);
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

// const ViewProjectReport = (req, res) => {
//   const { reporting_manager_id } = req.params;
//   console.log("reporting manager id", reporting_manager_id);

//   try {
//     const query =
//       "SELECT * FROM team LEFT JOIN project_master on team.project_id = project_master.project_id WHERE reporting_manager_id=?";
//     //   "SELECT * FROM team LEFT JOIN project_master on team.project_id = project_master.project_id LEFT JOIN employee_master AS em ON em.employee_id=team.reporting_manager_id WHERE reporting_manager_id=?";
//     connection.query(query, reporting_manager_id, (err, results) => {
//       if (err) throw err;
//       console.log("***********************", results);
//       temp = JSON.parse(JSON.stringify(results));
//       //   console.log("data", temp);
//       for (index in temp) {
//         console.log(temp[index].employee_id);
//         const teamArray = JSON.parse(temp[index].employee_id);
//         temp[index].employee_id = teamArray;
//         console.log("teamArrya", typeof teamArray);
//       }
//       const resultsArray = [];
//       temp.map((obj) => {
//         const { team_id, project_id, employee_id } = obj;
//         console.log(
//           "{ team_id, project_id, employee_id },reporting_manager_id",
//           {
//             team_id,
//             project_id,
//             employee_id,
//           },
//           reporting_manager_id
//         );
//         const employeeResults = [];
//         employee_id.forEach((id) => {
//           console.log("employee id query", id);
//           const query = `SELECT e.employee_id,e.actual_time,e.allocated_time,e.status,SUM(allocated_time) AS total_allocated_time, SUM(actual_time) AS total_actual_time,em.name FROM employee AS e LEFT JOIN employee_master AS em ON e.employee_id=em.employee_id LEFT JOIN project_master AS pm ON e.project_id = pm.project_id WHERE e.project_id=? AND e.employee_id=? AND e.manager_id=?`;
//           try {
//             connection.query(
//               query,
//               [project_id, id, reporting_manager_id],
//               (err, results) => {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   //   console.log("\nresult per employee:", results);
//                   results = JSON.parse(JSON.stringify(results));
//                   employeeResults.push(results);
//                 //   console.log("employeeResults", employeeResults);
//                 }
//               }
//             );
//           } catch (error) {
//             console.log(error);
//           }
//         });
//         resultsArray.push(employeeResults);
//       });
//       console.log("************************results array", resultsArray);
//       return res.status(StatusCodes.OK).json({ data: temp });
//     });
//   } catch (error) {
//     console.log("error", error);
//   }
// };

module.exports = { ViewProjectReport };
