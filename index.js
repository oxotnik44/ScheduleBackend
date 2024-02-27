const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const groupsRouter = require("./Groups/groupRouter");
const scheduleStudentRouter = require("./ScheduleStudent/scheduleStudentRouter");
const scheduleEducatorRouter = require("./ScheduleEducator/scheduleEducatorRouter");
const departmentsRouter = require("./Departments/departmentsRouter");
const authorizationRouter = require("./Authorization/authorizationRouter");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

groupsRouter(app);
scheduleStudentRouter(app);
scheduleEducatorRouter(app);
departmentsRouter(app);
authorizationRouter(app)
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
