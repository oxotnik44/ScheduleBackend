"use strict";

module.exports = (app) => {
  const scheduleEducatorController = require("./scheduleEducatorController");

  app.route("/getEducator").get(scheduleEducatorController.getEducator);
  app
    .route("/getScheduleEducator")
    .post(scheduleEducatorController.getScheduleEducator);
  app
    .route("/getFullScheduleEducatorExtramural")
    .post(scheduleEducatorController.getFullScheduleEducatorExtramural);
};
