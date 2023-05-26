const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const groupsRouter = require("./Groups/groupRouter");
const scheduleRouter = require(".//Schedule/scheduleRouter");
const departmentsRouter = require("./Departments/departmentsRouter");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

groupsRouter(app);
scheduleRouter(app);
departmentsRouter(app);
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
