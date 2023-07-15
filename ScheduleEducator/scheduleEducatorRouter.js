"use strict";

module.exports = (app) => {
  const scheduleEducatorController = require("./scheduleEducatorController");

  app
    .route("/getEducator")
    .get(scheduleEducatorController.getEducator);
};
