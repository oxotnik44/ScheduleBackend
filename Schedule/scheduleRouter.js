"use strict";

const groupController = require("./scheduleController");
module.exports = (app) => {
  const scheduleController = require("./scheduleController");

  app.route("/getSchedule").post(scheduleController.getSchedule);
};
