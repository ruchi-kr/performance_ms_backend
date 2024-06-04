const asyncConnection = require("../db2");

const RELATIONS = {
  employee: `
    ALTER TABLE employee
    ADD FOREIGN KEY (user_id) REFERENCES user_master(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (manager_id) REFERENCES employee_master(employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (employee_id) REFERENCES employee_master(employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (project_id) REFERENCES project_master(project_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (task_id) REFERENCES task_master(task_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    MODIFY id int(50) NOT NULL AUTO_INCREMENT
    ;
    `,
  employee_master: `
    ALTER TABLE employee_master
    ADD FOREIGN KEY (manager_id) REFERENCES employee_master(employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (designation_id) REFERENCES designation_master(designation_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (job_id) REFERENCES job_role_master(job_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    MODIFY employee_id int(11) NOT NULL AUTO_INCREMENT
    ;
    `,
  manager_remarks: `
    ALTER TABLE manager_remarks
    ADD FOREIGN KEY (employee_id) REFERENCES employee_master(employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (manager_id) REFERENCES employee_master(manager_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    MODIFY remark_id int(20) NOT NULL AUTO_INCREMENT    
    ;
    `,
  module_master: `
    ALTER TABLE module_master
    ADD FOREIGN KEY (project_id) REFERENCES project_master(project_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (task_id) REFERENCES task_master(task_id)  ON DELETE RESTRICT ON UPDATE CASCADE,
    MODIFY module_id int(20) NOT NULL AUTO_INCREMENT   
    ;
    `,
  designation_master: `
    ALTER TABLE designation_master
    MODIFY designation_id int(20) NOT NULL AUTO_INCREMENT
    ;
    `,
  job_role_master: `
    ALTER TABLE job_role_master
    MODIFY job_id int(20) NOT NULL AUTO_INCREMENT
    ;
    `,
  project_master: `
    ALTER TABLE project_master
    ADD FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    MODIFY project_id int(50) NOT NULL AUTO_INCREMENT
    ;
    `,
  project_plan: `
    ALTER TABLE project_plan
    ADD FOREIGN KEY (project_id) REFERENCES project_master(project_id)  ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (module_id) REFERENCES module_master(module_id)  ON DELETE RESTRICT ON UPDATE CASCADE,
    MODIFY plan_id int(20) NOT NULL AUTO_INCREMENT
    ;
    `,
  task_master: `
    ALTER TABLE task_master
    ADD FOREIGN KEY (job_id) REFERENCES job_role_master(job_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD FOREIGN KEY (module_id) REFERENCES module_master(module_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    MODIFY task_id int(20) NOT NULL AUTO_INCREMENT
    ;
    `,
  team: `
    ALTER TABLE team
    ADD FOREIGN KEY (project_id) REFERENCES project_master(project_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    MODIFY team_id int(11) NOT NULL AUTO_INCREMENT
    ;
    `,
  system_settings: `
  ALTER TABLE system_settings
  MODIFY settings_id int(11) NOT NULL AUTO_INCREMENT
    ;
    `,
  user_master: `
  ALTER TABLE user_master
  MODIFY user_id int(20) NOT NULL AUTO_INCREMENT
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
