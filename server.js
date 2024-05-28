const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mysql = require("mysql");
require("dotenv").config();
const app = express();
const port = 8000;
console.log("dot env", process.env.HOST);
app.use(cors());
app.use(express.json());

app.use(morgan("tiny"));
const teamsRoutes = require("./Routes/teamsRoutes");
const remarkRoutes = require("./Routes/remarkRoutes");
const dailReportViewManagerRoutes = require("./Routes/dailyReportToManager");
const projectReportRoutes = require("./Routes/projectReportRoutes");
const employeeRoportToManagerRoutes = require("./Routes/employeeReportToManagerRoutes");
const projectDetailedReportToManagerRoutes = require("./Routes/projectDetailedReportToManagerRoutes");
const getCurrentTimeStampRoutes = require("./Routes/currentTimeRouter");
const managerRemarksController = require("./Routes/managerRemarksController");
const projectPlanRoutes = require("./Routes/projectPlanRoutes");
const moduleTasksRoutes = require("./Routes/moduleTasksRouter");
const systemSettingsRoutes = require("./Routes/systemSettingsRouter");
const getProjectTotalManHoursRoutes = require("./Routes/getProjectTotalManHoursRoutes")
// app.use(require("./Routes/Auth_route"));
app.use(require("./Routes/Auth_route_email"));
app.use(require("./Routes/Employeemaster_route"));
app.use(require("./Routes/usermaster_route"));
app.use(require("./Routes/designation_master_route"));
app.use(require("./Routes/projectmaster_route"));
app.use(require("./Routes/dashdata_route"));
app.use(require("./Routes/remarkRoutes"));
app.use(require("./Routes/Upload_profile_route"));
//Teams routes
app.use("/api/user", teamsRoutes);   //MANAGER
app.use("/api", remarkRoutes);       //M
app.use("/api", dailReportViewManagerRoutes);     //M
app.use(require("./Routes/employee_route"));
app.use("/api", projectReportRoutes);
app.use("/api", employeeRoportToManagerRoutes);
app.use("/api", projectDetailedReportToManagerRoutes);
app.use("/api", getCurrentTimeStampRoutes);
app.use("/api", getProjectTotalManHoursRoutes);
app.use("/api", managerRemarksController);
app.use("/api", projectPlanRoutes);
app.use("/api", moduleTasksRoutes);
app.use("/api", systemSettingsRoutes);
app.use(require("./Routes/employee_report_route"));
app.use(require("./Routes/module_master_route"));
app.use(require("./Routes/job_role_master_route"));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
