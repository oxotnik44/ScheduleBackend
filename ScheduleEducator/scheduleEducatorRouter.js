"use strict";

module.exports = (app) => {
  const scheduleEducatorController = require("./scheduleEducatorController");

  app.route("/getEducator").get(scheduleEducatorController.getEducator);
  app
    .route("/getScheduleEducatorResidents")
    .post(scheduleEducatorController.getScheduleEducatorResidents);
  app
    .route("/getScheduleEducatorExtramuralist")
    .post(scheduleEducatorController.getScheduleEducatorExtramuralist);
};
