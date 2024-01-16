"use strict";

module.exports = (app) => {
    const authorizationController = require("./authorizationController");

    app.route("/authorization").post(authorizationController.authorization);
};