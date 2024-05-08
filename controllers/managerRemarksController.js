const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const GetManagerRemarks = async (req, res) => {
  const { reporting_manager_id, employee_id } = req.params;
  const query =
    "SELECT * FROM manager_remarks WHERE employee_id= ? AND manager_id=? ORDER BY created_at DESC LIMIT 1";
  // const query =
  //   "SELECT employee.* , em.* FROM employee JOIN user_master AS um ON um.user_id = employee.user_id JOIN employee_master AS em ON em.employee_id = um.employee_id WHERE employee.employee_id= ?";
  connection.query(
    query,
    [employee_id, reporting_manager_id],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        res.status(200).json(results);
      }
    }
  );
};
const AddManagerRemarks = async (req, res) => {
  const { reporting_manager_id, employee_id } = req.params;
  const { from_date, to_date, rating, remark } = req.body;
  console.log(
    "{ from_date, to_date, rating, remark } { reporting_manager_id, employee_id }",
    from_date,
    to_date,
    rating,
    remark,
    reporting_manager_id,
    employee_id
  );
  let remarkForWeekStatus = 0;
  const query = `
  SELECT *,COUNT(remark_id) AS remark_count
FROM manager_remarks
WHERE manager_id = ?
  AND employee_id = ?
  AND to_date <= ?
  AND from_date >= ?;
  `;
  connection.query(
    query,
    [reporting_manager_id, employee_id, to_date, from_date],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      } else {
        results = JSON.parse(JSON.stringify(results));
        console.log(results);
        remarkForWeekStatus = results[0].remark_count;
        console.log(remarkForWeekStatus);
        if (remarkForWeekStatus > 0) {
          return res
            .status(StatusCodes.CONFLICT)
            .json({ error: "Remark already added for current week!" });
        } else {
          try {
            const query =
              "INSERT INTO manager_remarks ( employee_id,manager_id,remark,rating,to_date,from_date ) VALUES (?,?,?,?, ?, ?)";
            connection.query(
              query,
              [
                employee_id,
                reporting_manager_id,
                remark,
                rating,
                to_date,
                from_date,
              ],
              (err, results) => {
                if (err) {
                  console.log(err);
                  res.status(500).json({
                    error: "An error occurred while processing your request.",
                  });
                } else {
                  return res.status(200).send("Remark Added Successfully!");
                }
              }
            );
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  );
};
const EditManagerRemarks = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "edit route accessed" });
};
const DeleteManagerRemarks = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "delete edit route accessed" });
};

module.exports = {
  GetManagerRemarks,
  AddManagerRemarks,
  EditManagerRemarks,
  DeleteManagerRemarks,
};
