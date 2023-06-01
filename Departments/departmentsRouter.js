"use strict";
const express = require("express");
const app = express();
module.exports = (app) => {
  const departmentsController = require("./departmentsController");
  app.route("/getDepartments").get(departmentsController.getDepartments);
};
