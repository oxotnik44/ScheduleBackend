'use strict'

const groupController = require("./scheduleController");
module.exports = (app) =>{
    const scheduleController = require("./scheduleController")

    app.route('/getScheduleResidents').post(scheduleController.getScheduleResidents)
    app.route('/getScheduleExtramuralists').post(scheduleController.getScheduleExtramuralists)

}