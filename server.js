const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mysql = require("mysql");

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.use(morgan("tiny"));
const teamsRoutes = require("./Routes/teamsRoutes");
const remarkRoutes = require("./Routes/remarkRoutes");
const dailReportViewManagerRoutes = require("./Routes/dailyReportToManager");
app.use(require("./Routes/Auth_route"));
app.use(require("./Routes/Employeemaster_route"));
app.use(require("./Routes/usermaster_route"));
app.use(require("./Routes/designation_master_route"));
app.use(require("./Routes/projectmaster_route"));
app.use(require("./Routes/remarkRoutes"));
//Teams routes
app.use("/api/user", teamsRoutes);
app.use("/api", remarkRoutes);
app.use("/api", dailReportViewManagerRoutes);
app.use(require("./Routes/employee_route"));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
