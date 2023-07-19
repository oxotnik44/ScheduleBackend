"use strict";

module.exports = (app) => {
  const scheduleStudentController = require("./scheduleStudentController");

  app
    .route("/getScheduleStudent")
    .post(scheduleStudentController.getScheduleStudent);
   
};
