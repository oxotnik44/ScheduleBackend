const db = require("../db");

exports.getDepartments = (req, res) => {
  db.query(
    "SELECT id AS idDepartment, name AS nameDepartment, pic AS picture, fullname AS fullnameDepartment FROM dek_dep",
    (error, rows) => {
      if (error) {
        console.log(error);
      } else {
        const filteredRows = rows.filter(
          (row) =>
            row.fullnameDepartment &&
            row.nameDepartment &&
            row.idDepartment !== 1
        );
        res.status(200).json(filteredRows);
      }
    }
  );
};
