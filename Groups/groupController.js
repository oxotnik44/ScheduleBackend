"use strict";

const db = require("../db");

exports.getGroupsResidents = (req, res) => {
  const { id_dep } = req.body;
  db.query(
    `SELECT 
      dek_group.id AS idGroup,
      dek_group.name AS nameGroup
    FROM dek_group
    WHERE dek_group.id_dep = ${id_dep}
    ORDER BY dek_group.name ASC`,
    (error, rows) => {
      if (error) {
        console.log(error);
      } else {
        const result = rows.map((row) => ({
          idGroup: row.idGroup,
          nameGroup: row.nameGroup,
        }));
        res.status(200).json(result);
      }
    }
  );
};

exports.getGroupsExtramuralists = (req, res) => {
  const { id_dep } = req.body;

  db.query(
    `SELECT 
      dek_zgroup.id AS idGroup,
      dek_zgroup.name AS nameGroup
    FROM dek_zgroup
    WHERE dek_zgroup.id_dep = ${id_dep}
    ORDER BY dek_zgroup.name ASC`,
    (error, rows) => {
      if (error) {
        console.log(error);
      } else {
        const result = rows.map((row) => ({
          idGroup: row.idGroup,
          nameGroup: row.nameGroup,
        }));
        res.status(200).json(result);
      }
    }
  );
};

exports.getGroups = (req, res) => {
  db.query(
    `SELECT id AS idGroup, name AS nameGroup FROM dek_group UNION  SELECT id AS idGroup, name AS nameGroup FROM dek_zgroup`,
    (error, rows) => {
      if (error) {
        console.log(error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching groups" });
      } else {
        res.status(200).json(rows);
      }
    }
  );
};
