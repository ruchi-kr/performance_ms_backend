const { StatusCodes } = require("http-status-codes");
const connection = require("../db");
// // MySQL connection
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "performancems",
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log("Connected to MySQL database in teams");
// });
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

module.exports = { GetReportingManagerForEmployee };
