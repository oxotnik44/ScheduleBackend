"use strict";

module.exports = (app) => {
    const authorizationController = require("./authorizationController");

    app.route("/authorization").get(authorizationController.authorization);
};