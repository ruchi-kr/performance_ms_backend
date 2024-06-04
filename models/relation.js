const asyncConnection = require("../db2");

const RELATIONS = {
  employee: `
    ALTER TABLE employee
    ADD FOREIGN KEY (user_id) REFERENCES user_master(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (manager_id) REFERENCES employee_master(employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (employee_id) REFERENCES employee_master(employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (project_id) REFERENCES project_master(project_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (task_id) REFERENCES task_master(task_id) ON DELETE RESTRICT ON UPDATE CASCADE
    ;
    `,
  employee_master: `
    ALTER TABLE employee_master
    ADD FOREIGN KEY (manager_id) REFERENCES employee_master(employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (designation_id) REFERENCES designation_master(designation_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (job_id) REFERENCES job_role_master(job_id) ON DELETE RESTRICT ON UPDATE CASCADE
    ;
    `,
  manager_remarks: `
    ALTER TABLE manager_remarks
    ADD FOREIGN KEY (employee_id) REFERENCES employee_master(employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (manager_id) REFERENCES employee_master(manager_id) ON DELETE RESTRICT ON UPDATE CASCADE    
    ;
    `,
  module_master: `
    ALTER TABLE module_master
    ADD FOREIGN KEY (project_id) REFERENCES project_master(project_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (task_id) REFERENCES task_master(task_id)  ON DELETE RESTRICT ON UPDATE CASCADE   
    ;
    `,
  project_master: `
    ALTER TABLE project_master
    ADD FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE RESTRICT ON UPDATE CASCADE
    ;
    `,
  project_plan: `
    ALTER TABLE project_plan
    ADD FOREIGN KEY (project_id) REFERENCES project_master(project_id)  ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (module_id) REFERENCES module_master(module_id)  ON DELETE RESTRICT ON UPDATE CASCADE
    ;
    `,
  task_master: `
    ALTER TABLE task_master
    ADD FOREIGN KEY (job_id) REFERENCES job_role_master(job_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE RESTRICT ON UPDATE CASCADE
    ;
    `,
  team: `
    ALTER TABLE team
    ADD FOREIGN KEY (project_id) REFERENCES project_master(project_id) ON DELETE RESTRICT ON UPDATE CASCADE
    ;
    `,
};

const createRelation = async () => {
  const newConnection = await asyncConnection.getConnection();

  try {
    await newConnection.beginTransaction();
    for (const relation in RELATIONS) {
      console.log("Running relationship query for ", relation);
      newConnection.query(RELATIONS[relation]);
    }
    await newConnection.commit();
    console.log("All relations created successfully");
  } catch (error) {
    newConnection.rollback();
  } finally {
    newConnection.release();
    console.log("Connection released successfully");
  }
};

module.exports = { createRelation };
