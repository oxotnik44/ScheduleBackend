"use strict";
const db = require("../db");

exports.getScheduleResidents = (req, res) => {
  const { id_group } = req.body;
  db.query(
    `SELECT 
        dek_group_predmet.id AS idPair,
        dek_room.number AS roomNumber,
        CASE
            WHEN dek_group_predmet.day = 1 THEN 'Понедельник'
            WHEN dek_group_predmet.day = 2 THEN 'Вторник'
            WHEN dek_group_predmet.day = 3 THEN 'Среда'
            WHEN dek_group_predmet.day = 4 THEN 'Четверг'
            WHEN dek_group_predmet.day = 5 THEN 'Пятница'
            WHEN dek_group_predmet.day = 6 THEN 'Суббота'
            WHEN dek_group_predmet.day = 7 THEN 'Воскресенье'
            ELSE ''
        END AS weekday,
        dek_group_predmet.para AS numberPair,
        dek_cpoints.short AS typePair,
        dek_group_predmet.predmet AS namePair,
        CONCAT(
          SUBSTRING_INDEX(dek_prepod.name, ' ', 1),
          ' ',
          UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 1, 1)),
          '.',
          UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 2, 1)),
          '.'
        ) AS nameEducator,
        dek_group_predmet.id_prep AS idEducator,
        dek_prepod.regalia AS regaliaEducator
    FROM dek_group_predmet
    LEFT JOIN dek_prepod ON dek_prepod.id = dek_group_predmet.id_prep
    LEFT JOIN dek_room ON dek_room.id = dek_group_predmet.id_room
    LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_group_predmet.lek_sem
    WHERE dek_group_predmet.id_group = ${id_group}`,
    (error, rows) => {
      const timeIntervals = [
        "8:30-10:00",
        "10:10-11:40",
        "12:10-13:40",
        "14:10-15:40",
        "15:50-17:20",
        "17:30-19:00",
        "19:10-20:40",
      ];
      if (error) {
        console.log(error);
      } else {
        const filteredRows = rows.filter((row) => row.idEducator >= 0);
        filteredRows.forEach((row) => {
          const numberPair = row.numberPair;
          if (numberPair >= 1 && numberPair <= timeIntervals.length) {
            row.numberPair = timeIntervals[numberPair - 1];
          }
        });
        res.status(200).json(filteredRows);
      }
    }
  );
};

exports.getScheduleExtramuralists = (req, res) => {
  const { id_group } = req.body;
  db.query(
    `SELECT 
        dek_zgroup_predmet.id AS idPair,
        dek_zgroup_predmet.id_room AS idRoom,
        dek_zgroup_predmet.para AS numberPair,
        dek_zgroup_predmet.predmet AS namePair,
        CONCAT(
          SUBSTRING_INDEX(dek_prepod.name, ' ', 1),
          ' ',
          UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 1, 1)),
          '.',
          UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 2, 1)),
          '.'
        ) AS nameEducator,
        dek_zgroup_predmet.id_prep AS idEducator,
        dek_prepod.regalia AS regaliaEducator
    FROM dek_zgroup_predmet
    LEFT JOIN dek_prepod ON dek_prepod.id = dek_zgroup_predmet.id_prep
    WHERE dek_zgroup_predmet.id_group = ${id_group}`,
    (error, rows) => {
      const timeIntervals = [
        "8:30-10:00",
        "10:10-11:40",
        "12:10-13:40",
        "14:10-15:40",
        "15:50-17:20",
        "17:30-19:00",
        "19:10-20:40",
      ];
      if (error) {
        console.log(error);
      } else {
        const filteredRows = rows.filter((row) => row.idEducator >= 0);
        filteredRows.forEach((row) => {
          const numberPair = row.numberPair;
          if (numberPair >= 1 && numberPair <= timeIntervals.length) {
            row.numberPair = timeIntervals[numberPair - 1];
          }
        });
        res.status(200).json(filteredRows);
      }
    }
  );
};
exports.getSchedule = (req, res) => {
  const { id_group } = req.body;

  db.query(
    `SELECT
      dek_group_predmet.id AS idPair,
      dek_room.number AS roomNumber,
      CASE
          WHEN dek_group_predmet.day = 1 THEN 'Понедельник'
          WHEN dek_group_predmet.day = 2 THEN 'Вторник'
          WHEN dek_group_predmet.day = 3 THEN 'Среда'
          WHEN dek_group_predmet.day = 4 THEN 'Четверг'
          WHEN dek_group_predmet.day = 5 THEN 'Пятница'
          WHEN dek_group_predmet.day = 6 THEN 'Суббота'
          WHEN dek_group_predmet.day = 7 THEN 'Воскресенье'
          ELSE ''
      END AS weekday,
      dek_group_predmet.para AS numberPair,
      dek_cpoints.short AS typePair,
      dek_group_predmet.predmet AS namePair,
      CONCAT(
        SUBSTRING_INDEX(dek_prepod.name, ' ', 1),
        ' ',
        UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 1, 1)),
        '.',
        UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 2, 1)),
        '.'
      ) AS nameEducator,
      dek_group_predmet.id_prep AS idEducator,
      dek_prepod.regalia AS regaliaEducator
    FROM dek_group_predmet
    LEFT JOIN dek_prepod ON dek_prepod.id = dek_group_predmet.id_prep
    LEFT JOIN dek_room ON dek_room.id = dek_group_predmet.id_room
    LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_group_predmet.lek_sem
    WHERE dek_group_predmet.id_group = ${id_group}
      AND dek_group_predmet.id_prep != -1

    UNION

    SELECT
      dek_zgroup_predmet.id AS idPair,
      dek_room.number AS roomNumber,
      '' AS weekday,
      dek_zgroup_predmet.para AS numberPair,
      '' AS typePair,
      dek_zgroup_predmet.predmet AS namePair,
      CONCAT(
        SUBSTRING_INDEX(dek_prepod.name, ' ', 1),
        ' ',
        UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 1, 1)),
        '.',
        UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 2, 1)),
        '.'
      ) AS nameEducator,
      dek_zgroup_predmet.id_prep AS idEducator,
      dek_prepod.regalia AS regaliaEducator
    FROM dek_zgroup_predmet
    LEFT JOIN dek_prepod ON dek_prepod.id = dek_zgroup_predmet.id_prep
    LEFT JOIN dek_room ON dek_room.id = dek_zgroup_predmet.id_room
    WHERE dek_zgroup_predmet.id_group = ${id_group}
      AND dek_zgroup_predmet.id_prep != -1`,
    (error, rows) => {
      const timeIntervals = [
        "8:30-10:00",
        "10:10-11:40",
        "12:10-13:40",
        "14:10-15:40",
        "15:50-17:20",
        "17:30-19:00",
        "19:10-20:40",
      ];
      if (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
      } else {
        const filteredRows = rows.filter((row) => row.idPair !== null);
        filteredRows.forEach((row) => {
          const numberPair = row.numberPair;
          if (numberPair >= 1 && numberPair <= timeIntervals.length) {
            row.numberPair = timeIntervals[numberPair - 1];
          }
        });

        res.status(200).json(filteredRows);
      }
    }
  );
};
