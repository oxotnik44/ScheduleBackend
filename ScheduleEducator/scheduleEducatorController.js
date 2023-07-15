"use strict";
const db = require("../db");

exports.getScheduleEducator = (req, res) => {
  db.query(
    `SELECT id AS idEducator, name AS nameEducator, regalia AS regaliaEducator FROM dek_prepod
     `,
    (error, rows) => {
      res.status(200).json(rows);
    }
  );
};
