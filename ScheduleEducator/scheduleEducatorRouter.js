"use strict";

module.exports = (app) => {
  const scheduleEducatorController = require("./scheduleEducatorController");

  app
    .route("/getScheduleEducator")
    .get(scheduleEducatorController.getScheduleEducator);
};
