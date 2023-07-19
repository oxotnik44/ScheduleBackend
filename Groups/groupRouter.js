'use strict'

module.exports = (app) =>{
    const groupController = require("./groupController")

    app.route('/getGroupsResidents').post(groupController.getGroupsResidents)
    app.route('/getGroupsExtramuralists').post(groupController.getGroupsExtramuralists)

    app.route('/getGroups').get(groupController.getGroups)
}