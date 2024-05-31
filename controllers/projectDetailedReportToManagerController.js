const { StatusCodes } = require("http-status-codes");
const connection = require("../db");
const asyncConnection = require("../db2");

const ViewProjectReport = async (req, res) => {
  const { reporting_manager_id } = req.params;
  const { toDate, fromDate, search, stage } = req.query;
  console.log(
    "detailed report to manager -------> yahan hun ---->yahan hi hun22"
  );
  let stageSearch;
  //   stage === "all" ? (stageSearch = "all") : (stageSearch = stage);

  let altQuery = "";

  if (
    (toDate === null || toDate === "null" || toDate === undefined) &&
    (fromDate === null || fromDate === "null" || fromDate === undefined)
  ) {
    console.log("running default date range");
    altQuery = `
    SELECT 
    mm.project_id,
    pm.project_name,
    pm.schedule_start_date,
    pm.schedule_end_date,
    SUM(e.allocated_time) AS total_allocated_time,
    SUM(e.actual_time) AS total_actual_time,
    SUM(tm.allocated_time) AS project_allocated_time,
    CONCAT(
        '[',
        GROUP_CONCAT(
            CONCAT(
                '{', 
                '"task_id":', tm.task_id, 
                ',"employee_id":', IFNULL(e.employee_id, 'null'), 
                ', "name":"', IFNULL(em.name, 'null'),                
                '", "task":"', tm.task_name, 
                '","module_id":', tm.module_id, 
                ',"planned_task_allocated_time":', tm.allocated_time, 
                ', "module_name":"', IFNULL(mm.module_name, 'null'),
                '", "task_percent":', IFNULL(e.task_percent, 'null'),
                ', "allocated_time":', IFNULL(e.allocated_time, 'null'),  
                ', "actual_time":', IFNULL(e.actual_time, 'null'),                 
                ', "status":"', IFNULL(e.status, 'null'), 
                '", "project_id":', IFNULL(mm.project_id, 'null'), 
                ', "project_name":"', IFNULL(pm.project_name, 'null'), 
                '", "created_at":"', IFNULL(DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'), 'null'),
                '", "updated_at":"', IFNULL(DATE_FORMAT(e.updated_at, '%Y-%m-%d %H:%i:%s'), 'null'), 
                '", "actual_end_date":"', IFNULL(DATE_FORMAT(e.actual_end_date, '%Y-%m-%d %H:%i:%s'), 'null'),
                '"}'
            ) ORDER BY e.created_at DESC SEPARATOR ', '
        ),
        ']'
    ) AS tasks_details,
    MAX(CASE 
        WHEN e.actual_time > e.allocated_time THEN e.actual_time - e.allocated_time 
        ELSE 0 
    END) AS max_time_variance,
    COUNT(e.id) AS total_tasks
FROM 
    task_master AS tm
LEFT JOIN 
    employee AS e ON tm.task_id = e.task_id
LEFT JOIN 
    module_master AS mm ON tm.module_id = mm.module_id
LEFT JOIN 
    project_master AS pm ON mm.project_id = pm.project_id
LEFT JOIN
    employee_master AS em ON e.employee_id = em.employee_id
WHERE 
    (e.manager_id = ? OR e.manager_id IS NULL)
AND
    (e.created_at >= DATE_ADD(NOW(), INTERVAL -30 DAY) OR e.created_at IS NULL)
AND
    (LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%')) OR ? = '' OR em.name IS NULL)
AND
    (? = 'all' OR pm.stage = ? OR pm.stage IS NULL)
GROUP BY 
    mm.project_id, pm.project_name, pm.schedule_start_date, pm.schedule_end_date
ORDER BY
    pm.project_name;

        `;
  } else {
    console.log("Running specific date range query");

    altQuery = `
        SELECT 
            pm.project_id,
            pm.project_name,    
            pm.schedule_start_date,
            pm.schedule_end_date,
            SUM(e.allocated_time) AS total_allocated_time,
            SUM(e.actual_time) AS total_actual_time,
            CONCAT(
                '[',
                GROUP_CONCAT(
                    CONCAT(
                        '{', 
                        '"task_id":', e.id, 
                        ',"employee_id":', e.employee_id, 
                        ', "name":"',em.name,                
                        '", "task":"', tm.task_name, 
                        '","module_id":', mm.module_id,    
                        ',"planned_task_allocated_time":', tm.allocated_time,             
                        ', "module_name":"',mm.module_name,
                        '", "task_percent":',e.task_percent,
                        ', "allocated_time":', e.allocated_time,  
                        ', "actual_time":', e.actual_time,                 
                        ', "status":"', e.status, 
                        '", "project_id":', e.project_id, 
                        ', "project_name":"', pm.project_name, 
                        '", "created_at":"', IFNULL(DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'), 'null'),
                        '", "updated_at":"', IFNULL(DATE_FORMAT(e.updated_at, '%Y-%m-%d %H:%i:%s'), 'null'), 
                        '", "actual_end_date":"', IFNULL(DATE_FORMAT(e.actual_end_date, '%Y-%m-%d %H:%i:%s'), 'null'), 
                        '"}'
                    )ORDER BY e.created_at DESC SEPARATOR ', '
                ),
                ']'
            ) AS tasks_details
        FROM 
            employee AS e
        LEFT JOIN 
            project_master AS pm ON e.project_id = pm.project_id
        JOIN
            employee_master AS em ON em.employee_id = e.employee_id
        LEFT JOIN 
            task_master AS tm ON tm.task_id = e.task_id
        LEFT JOIN
            module_master AS mm ON e.module_id = mm.module_id
        WHERE 
            e.manager_id = ?
        AND 
            (LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%')) OR ? = '')
        AND
            (? = 'all' OR pm.stage = ?)
        AND 
            DATE(e.created_at) BETWEEN ? AND ?
        GROUP BY 
            e.project_id
        ORDER BY
            pm.project_name;
        `;
  }

  const [totalManDays] = await asyncConnection.query(
    "SELECT pm.project_id,pm.project_name,pm.status,   SUM(CAST(tm.allocated_time AS DECIMAL(10, 2))) AS total_man_days FROM project_master AS pm LEFT JOIN   module_master AS mm ON pm.project_id = mm.project_id LEFT JOIN task_master AS tm ON mm.module_id = tm.module_id WHERE pm.status LIKE 'in progress' GROUP BY pm.project_id;"
  );
  const [totalPlannedTasks] = await asyncConnection.query(
    "SELECT pm.project_id, pm.project_name, COUNT(tm.task_id) AS total_planned_tasks FROM project_master AS pm LEFT JOIN module_master AS mm ON pm.project_id = mm.project_id LEFT JOIN task_master AS tm ON mm.module_id = tm.module_id GROUP BY pm.project_id, pm.project_name ORDER BY pm.project_name;"
  );
  const [delayDays] = await asyncConnection.query(
    "SELECT pm.project_id,pm.project_name,pm.schedule_end_date,IFNULL(DATEDIFF((SELECT MAX(e.created_at) FROM employee AS e WHERE e.project_id = pm.project_id),pm.schedule_end_date),0) AS delay_days FROM project_master AS pm ORDER BY pm.project_name;"
  );
  const [totalUniqueTaskPercent] = await asyncConnection.query(
    "SELECT pm.project_id,pm.project_name,SUM(e.task_percent) AS total_task_percentage FROM project_master AS pm LEFT JOIN module_master AS mm ON pm.project_id = mm.project_id LEFT JOIN task_master AS tm ON mm.module_id = tm.module_id LEFT JOIN (SELECT e.task_id, MAX(e.id) AS max_id FROM employee AS e GROUP BY e.task_id) AS recent_tasks ON tm.task_id = recent_tasks.task_id LEFT JOIN employee AS e ON recent_tasks.max_id = e.id GROUP BY pm.project_id, pm.project_name ORDER BY pm.project_name;"
  );
  try {
    const [results] = await asyncConnection.query(altQuery, [
      reporting_manager_id,
      search,
      search,
      stage,
      stage,
      toDate,
      fromDate,
    ]);

    // console.log("obj", results);

    const temp = results.map((item) => {
      const match = totalManDays.find((i) => i.project_id === item.project_id);
      // If a match is found, insert the total_allocated_hours into the second array
      if (match) {
        // console.log("match", match);
        item.total_allocated_man_days = match.total_man_days;
      }
      return {
        total_allocated_man_days: match.total_man_days * 8,
        ...item,
        // tasks_details: JSON.parse(item.tasks_details),
      };
    });

    const tempDelaydays = temp.map((item) => {
      const match = delayDays.find((i) => i.project_id === item.project_id);
      if (match) {
        item.delay_days = match.delay_days;
      }
      return {
        ...item,
      };
    });

    const tempUniqueTaskPercent = tempDelaydays.map((item) => {
      const match = totalUniqueTaskPercent.find(
        (i) => i.project_id === item.project_id
      );
      if (match) {
        item.total_uniqueTaskPercent =
          match.total_task_percentage !== null
            ? Number(match.total_task_percentage)
            : 0;
      }
      return {
        ...item,
      };
    });
    // console.log("temp unique percent",tempUniqueTaskPercent)
    const newtemp = tempUniqueTaskPercent.map((item) => {
      console.log("project_id", item.project_id);
      const match = totalPlannedTasks.find(
        (i) => i.project_id === item.project_id
      );
      // If a match is found, insert the total_allocated_hours into the second array
      if (match) {
        console.log("match", match);
        item.total_planned_tasks = match.total_planned_tasks;
      }
      return {
        ...item,
        tasks_details: JSON.parse(item.tasks_details),
      };
    });
    return res.status(StatusCodes.OK).json(newtemp);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};
const ViewParticularProjectReport = async (req, res) => {
  const { reporting_manager_id, project_id } = req.params;
  const { toDate, fromDate, search, stage } = req.query;
  console.log(
    "detailed report to manager -------> yahan hun ---->yahan hi hun22"
  );
  let stageSearch;
  //   stage === "all" ? (stageSearch = "all") : (stageSearch = stage);

  let altQuery = "";

  if (
    (toDate === null || toDate === "null" || toDate === undefined) &&
    (fromDate === null || fromDate === "null" || fromDate === undefined)
  ) {
    console.log("running default date range");
    altQuery = `
    SELECT 
    mm.project_id,
    pm.project_name,
    pm.schedule_start_date,
    pm.schedule_end_date,
    SUM(e.allocated_time) AS total_allocated_time,
    SUM(e.actual_time) AS total_actual_time,
    SUM(tm.allocated_time) AS project_allocated_time,
    CONCAT(
        '[',
        GROUP_CONCAT(
            CONCAT(
                '{', 
                '"task_id":', tm.task_id, 
                ',"employee_id":', IFNULL(e.employee_id, 'null'), 
                ', "name":"', IFNULL(em.name, 'null'),                
                '", "task":"', tm.task_name, 
                '","module_id":', tm.module_id, 
                ',"planned_task_allocated_time":', tm.allocated_time, 
                ', "module_name":"', IFNULL(mm.module_name, 'null'),
                '", "task_percent":', IFNULL(e.task_percent, 'null'),
                ', "allocated_time":', IFNULL(e.allocated_time, 'null'),  
                ', "actual_time":', IFNULL(e.actual_time, 'null'),                 
                ', "status":"', IFNULL(e.status, 'null'), 
                '", "project_id":', IFNULL(mm.project_id, 'null'), 
                ', "project_name":"', IFNULL(pm.project_name, 'null'), 
                '", "created_at":"', IFNULL(DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'), 'null'),
                '", "updated_at":"', IFNULL(DATE_FORMAT(e.updated_at, '%Y-%m-%d %H:%i:%s'), 'null'), 
                '", "actual_end_date":"', IFNULL(DATE_FORMAT(e.actual_end_date, '%Y-%m-%d %H:%i:%s'), 'null'),
                '"}'
            ) ORDER BY e.created_at DESC SEPARATOR ', '
        ),
        ']'
    ) AS tasks_details,
    MAX(CASE 
        WHEN e.actual_time > e.allocated_time THEN e.actual_time - e.allocated_time 
        ELSE 0 
    END) AS max_time_variance,
    COUNT(e.id) AS total_tasks
FROM 
    task_master AS tm
LEFT JOIN 
    employee AS e ON tm.task_id = e.task_id
LEFT JOIN 
    module_master AS mm ON tm.module_id = mm.module_id
LEFT JOIN 
    project_master AS pm ON mm.project_id = pm.project_id
LEFT JOIN
    employee_master AS em ON e.employee_id = em.employee_id
WHERE 
    mm.project_id = ? -- Filter by specific project ID
AND
    (e.manager_id = ? OR e.manager_id IS NULL)
AND
    (e.created_at >= DATE_ADD(NOW(), INTERVAL -30 DAY) OR e.created_at IS NULL)
AND
    (LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%')) OR ? = '' OR em.name IS NULL)
AND
    (? = 'all' OR pm.stage = ? OR pm.stage IS NULL)
GROUP BY 
    mm.project_id, pm.project_name, pm.schedule_start_date, pm.schedule_end_date
ORDER BY
    pm.project_name;

    `;
  } else {
    console.log("Running specific date range query");

    altQuery = `
    SELECT 
    pm.project_id,
    pm.project_name,    
    pm.schedule_start_date,
    pm.schedule_end_date,
    SUM(e.allocated_time) AS total_allocated_time,
    SUM(e.actual_time) AS total_actual_time,
    CONCAT(
        '[',
        GROUP_CONCAT(
            CONCAT(
                '{', 
                '"task_id":', tm.task_id, 
                ',"employee_id":', IFNULL(e.employee_id, 'null'), 
                ', "name":"', IFNULL(em.name, 'null'),                
                '", "task":"', tm.task_name, 
                '","module_id":', tm.module_id,    
                ',"planned_task_allocated_time":', tm.allocated_time,             
                ', "module_name":"', IFNULL(mm.module_name, 'null'),
                '", "task_percent":', IFNULL(e.task_percent, 'null'),
                ', "allocated_time":', IFNULL(e.allocated_time, 'null'),  
                ', "actual_time":', IFNULL(e.actual_time, 'null'),                 
                ', "status":"', IFNULL(e.status, 'null'), 
                '", "project_id":', mm.project_id, 
                ', "project_name":"', IFNULL(pm.project_name, 'null'), 
                '", "created_at":"', IFNULL(DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s'), 'null'),
                '", "updated_at":"', IFNULL(DATE_FORMAT(e.updated_at, '%Y-%m-%d %H:%i:%s'), 'null'), 
                '", "actual_end_date":"', IFNULL(DATE_FORMAT(e.actual_end_date, '%Y-%m-%d %H:%i:%s'), 'null'), 
                '"}'
            )ORDER BY e.created_at DESC SEPARATOR ', '
        ),
        ']'
    ) AS tasks_details
FROM 
    task_master AS tm
LEFT JOIN 
    employee AS e ON tm.task_id = e.task_id
LEFT JOIN 
    module_master AS mm ON tm.module_id = mm.module_id
LEFT JOIN 
    project_master AS pm ON mm.project_id = pm.project_id
LEFT JOIN
    employee_master AS em ON e.employee_id = em.employee_id
WHERE 
    mm.project_id = ?
AND 
    (e.manager_id = ? OR e.manager_id IS NULL)
AND
    (LOWER(em.name) LIKE LOWER(CONCAT('%', ?, '%')) OR ? = '' OR em.name IS NULL)
AND
    (? = 'all' OR pm.stage = ? OR pm.stage IS NULL)
AND 
    (DATE(e.created_at) BETWEEN ? AND ? OR e.created_at IS NULL)
GROUP BY 
    mm.project_id, pm.project_name, pm.schedule_start_date, pm.schedule_end_date
ORDER BY
    pm.project_name;

        `;
  }

  const [totalManDays] = await asyncConnection.query(
    "SELECT pm.project_id,pm.project_name,pm.status,   SUM(CAST(tm.allocated_time AS DECIMAL(10, 2))) AS total_man_days FROM project_master AS pm LEFT JOIN   module_master AS mm ON pm.project_id = mm.project_id LEFT JOIN task_master AS tm ON mm.module_id = tm.module_id WHERE pm.status LIKE 'in progress' GROUP BY pm.project_id;"
  );
  const [totalPlannedTasks] = await asyncConnection.query(
    "SELECT pm.project_id, pm.project_name, COUNT(tm.task_id) AS total_planned_tasks FROM project_master AS pm LEFT JOIN module_master AS mm ON pm.project_id = mm.project_id LEFT JOIN task_master AS tm ON mm.module_id = tm.module_id GROUP BY pm.project_id, pm.project_name ORDER BY pm.project_name;"
  );
  const [delayDays] = await asyncConnection.query(
    "SELECT pm.project_id,pm.project_name,pm.schedule_end_date,IFNULL(DATEDIFF((SELECT MAX(e.created_at) FROM employee AS e WHERE e.project_id = pm.project_id),pm.schedule_end_date),0) AS delay_days FROM project_master AS pm ORDER BY pm.project_name;"
  );
  const [totalUniqueTaskPercent] = await asyncConnection.query(
    "SELECT pm.project_id,pm.project_name,SUM(e.task_percent) AS total_task_percentage FROM project_master AS pm LEFT JOIN module_master AS mm ON pm.project_id = mm.project_id LEFT JOIN task_master AS tm ON mm.module_id = tm.module_id LEFT JOIN (SELECT e.task_id, MAX(e.id) AS max_id FROM employee AS e GROUP BY e.task_id) AS recent_tasks ON tm.task_id = recent_tasks.task_id LEFT JOIN employee AS e ON recent_tasks.max_id = e.id GROUP BY pm.project_id, pm.project_name ORDER BY pm.project_name;"
  );
  try {
    const [results] = await asyncConnection.query(altQuery, [
      project_id,
      reporting_manager_id,
      search,
      search,
      stage,
      stage,
      toDate,
      fromDate,
    ]);

    // console.log("obj", results);

    const temp = results.map((item) => {
      const match = totalManDays.find((i) => i.project_id === item.project_id);
      // If a match is found, insert the total_allocated_hours into the second array
      if (match) {
        // console.log("match", match);
        item.total_allocated_man_days = match.total_man_days;
      }
      return {
        total_allocated_man_days: match.total_man_days * 8,
        ...item,
        // tasks_details: JSON.parse(item.tasks_details),
      };
    });

    const tempDelaydays = temp.map((item) => {
      const match = delayDays.find((i) => i.project_id === item.project_id);
      if (match) {
        item.delay_days = match.delay_days;
      }
      return {
        ...item,
      };
    });
    // console.log("delay days", tempDelaydays);
    const tempUniqueTaskPercent = tempDelaydays.map((item) => {
      const match = totalUniqueTaskPercent.find(
        (i) => i.project_id === item.project_id
      );
      if (match) {
        item.total_uniqueTaskPercent =
          match.total_task_percentage !== null
            ? Number(match.total_task_percentage)
            : 0;
      }
      return {
        ...item,
      };
    });

    const newtemp = tempUniqueTaskPercent.map((item) => {
      // console.log("project_id", item.project_id);
      const match = totalPlannedTasks.find(
        (i) => i.project_id === item.project_id
      );
      // If a match is found, insert the total_allocated_hours into the second array
      if (match) {
        // console.log("match", match);
        item.total_planned_tasks = match.total_planned_tasks;
      }
      return {
        ...item,
        tasks_details: JSON.parse(item.tasks_details),
      };
    });
    return res.status(StatusCodes.OK).json(newtemp);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};
module.exports = { ViewProjectReport, ViewParticularProjectReport };
