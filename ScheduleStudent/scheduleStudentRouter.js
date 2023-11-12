"use strict";

module.exports = (app) => {
  const scheduleStudentController = require("./scheduleStudentController");

  app
    .route("/getScheduleStudent")
    .post(scheduleStudentController.getScheduleStudent);
  app
    .route("/getFullScheduleStudentExtramuralist")
    .post(scheduleStudentController.getFullScheduleStudentExtramuralist);
  app
    .route("/getSessionScheduleStudent")
    .post(scheduleStudentController.getSessionScheduleStudent);
};
