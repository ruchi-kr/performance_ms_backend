const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const connection = require("../db");


// for date - wise report
router.get("/api/user/getReportsdwtest/:employee_id", (req, res) => {
    const employee_id = req.params.employee_id;

    const { page, pageSize } = req.query;

    // Validate page and pageSize
    if (!page || isNaN(page) || !pageSize || isNaN(pageSize)) {
        return res.status(400).send("Invalid page or pageSize");
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);


//     const query = `SELECT 
//     DATE(e.created_at) AS date,
//      SUM(e.allocated_time) AS total_allocated_hours,
//        SUM(e.actual_time) AS total_actual_hours,
//     p.project_name,
//     GROUP_CONCAT(
//         DISTINCT CONCAT(
//             '"project_id":', e.project_id,
            
//             ',"tasks":', (
//                 SELECT 
//                     CONCAT(
//                         '[',
//                         GROUP_CONCAT(
//                             CONCAT(
//                                 '{',
//                                  t.task,
//                                 '}'
//                             )SEPARATOR ', '
//                         ),
//                         ']'
//                     )
//                 FROM 
//                     employee t
//                 WHERE 
//                     t.project_id = e.project_id
//                     AND t.user_id = e.user_id
//                     AND DATE(t.created_at) = DATE(e.created_at) 
//                 GROUP BY e.project_id=t.project_id
//             )
//         )
//     ) AS projects
// FROM 
//     employee e
// JOIN 
//     project_master p ON e.project_id = p.project_id
// WHERE 
//     e.user_id = 32
// GROUP BY 
//     DATE(e.created_at)`;

    const query = `
    SELECT 
        DATE(e.created_at) AS date,
        SUM(e.allocated_time) AS total_allocated_hours,
        SUM(e.actual_time) AS total_actual_hours,
        p.project_name,
        GROUP_CONCAT(
            DISTINCT JSON_OBJECT(
                'project_id', e.project_id,
                'tasks', (
                    SELECT 
                        CONCAT(
                            '[',
                            GROUP_CONCAT(
                                JSON_OBJECT(
                                    'task', t.task,
                                )
                            ),
                            ']'
                        )
                    FROM 
                        employee t
                    WHERE 
                        t.project_id = e.project_id
                        AND t.user_id = e.user_id
                        AND DATE(t.created_at) = DATE(e.created_at)
                    GROUP BY 
                        e.project_id = t.project_id
                )
            )
        ) AS projects
    FROM 
        employee e
    JOIN 
        project_master p ON e.project_id = p.project_id
    WHERE 
        e.user_id = ?
    GROUP BY 
        DATE(e.created_at)`;


    connection.query(query, [employee_id, parseInt(pageSize), offset], (err, results) => {
        if (err) throw err;

        res.status(200).json(results);
    });
});





module.exports = router;