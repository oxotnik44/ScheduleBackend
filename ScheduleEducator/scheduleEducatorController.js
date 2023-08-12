"use strict";
const db = require("../db");
const moment = require("moment");

function getWeekNumber() {
  const currentDate = moment();
  const startOfYear = moment().startOf("year");
  const weekNumber = currentDate.diff(startOfYear, "weeks") + 1;
  return weekNumber;
}
exports.getEducator = (req, res) => {
  db.query(
    `SELECT id AS idEducator, name AS nameEducator, regalia AS regaliaEducator FROM dek_prepod
     `,
    (error, rows) => {
      res.status(200).json(rows);
    }
  );
};
exports.getScheduleEducatorResidents = (req, res) => {
  const { id_prep } = req.body;
  const currentWeek = getWeekNumber();

  db.query(
    `
    SELECT
      dek_group_predmet.id AS idPair,
      dek_room.number AS roomNumber,
      dek_group.name AS groupName,
      dek_group_predmet.chetnechet,
      CASE
        WHEN dek_group_predmet.day = 1 THEN 'Понедельник'
        WHEN dek_group_predmet.day = 2 THEN 'Вторник'
        WHEN dek_group_predmet.day = 3 THEN 'Среда'
        WHEN dek_group_predmet.day = 4 THEN 'Четверг'
        WHEN dek_group_predmet.day = 5 THEN 'Пятница'
        WHEN dek_group_predmet.day = 6 THEN 'Суббота'
        ELSE ''
      END AS weekday,
      dek_group_predmet.para AS numberPair,
      dek_cpoints.short AS typePair,
      dek_group_predmet.predmet AS namePair,
      NULL AS date
    FROM dek_group_predmet
    LEFT JOIN dek_group ON dek_group.id = dek_group_predmet.id_group
    LEFT JOIN dek_room ON dek_room.id = dek_group_predmet.id_room
    LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_group_predmet.lek_sem
    WHERE dek_group_predmet.id_prep = ${id_prep}
      AND dek_group_predmet.id_prep != -1
      AND dek_group_predmet.day <= 6
      AND dek_group_predmet.chetnechet IN (1, 2) -- Учитывать и четные, и нечетные недели
    ORDER BY 
      CASE WHEN weekday = 'Понедельник' THEN 1
           WHEN weekday = 'Вторник' THEN 2
           WHEN weekday = 'Среда' THEN 3
           WHEN weekday = 'Четверг' THEN 4
           WHEN weekday = 'Пятница' THEN 5
           WHEN weekday = 'Суббота' THEN 6
           WHEN weekday = 'Воскресенье' THEN 7
           ELSE 8
      END ASC, 
      chetnechet ASC, -- Сортировать по chetnechet, чтобы объединить четные и нечетные недели
      date ASC, 
      numberPair ASC;
    `,
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
        res.status(500).json({ error: "Произошла ошибка" });
      } else {
        const schedule = {
          nominator: [],
          denominator: [],
        };

        rows.forEach((row) => {
          const numberPair = row.numberPair;
          if (numberPair >= 1 && numberPair <= timeIntervals.length) {
            row.numberPair = timeIntervals[numberPair - 1];
          }

          if (row.chetnechet === 1) {
            schedule.nominator.push(row);
          } else if (row.chetnechet === 2) {
            schedule.denominator.push(row);
          }
        });

        res.status(200).json(schedule);
      }
    }
  );
};


exports.getScheduleEducatorExtramuralist = (req, res) => {
  const { id_prep } = req.body;

  db.query(
    `
    SELECT
    dek_zgroup_predmet.id AS idPair,
    dek_room.number AS roomNumber,
    dek_group.name AS groupName,
    NULL AS chetnechet,
    '' AS weekday,
    dek_zgroup_predmet.para AS numberPair,
    dek_cpoints.short AS typePair,
    dek_zgroup_predmet.predmet AS namePair,
    dek_zgroup_predmet.date AS date
  FROM dek_zgroup_predmet
  LEFT JOIN dek_group ON dek_group.id = dek_zgroup_predmet.id_group
  LEFT JOIN dek_room ON dek_room.id = dek_zgroup_predmet.id_room
  LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_zgroup_predmet.zach_exam
  WHERE dek_zgroup_predmet.id_prep = ${id_prep}
    AND dek_zgroup_predmet.id_prep != -1
  ORDER BY 
    CASE WHEN weekday = 'Понедельник' THEN 1
         WHEN weekday = 'Вторник' THEN 2
         WHEN weekday = 'Среда' THEN 3
         WHEN weekday = 'Четверг' THEN 4
         WHEN weekday = 'Пятница' THEN 5
         WHEN weekday = 'Суббота' THEN 6
         WHEN weekday = 'Воскресенье' THEN 7
         ELSE 8
    END ASC, 
    date ASC, 
    numberPair ASC
    `,
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
        res.status(500).json({ error: "Произошла ошибка" });
      } else {
        rows.forEach((row) => {
          const numberPair = row.numberPair;
          if (numberPair >= 1 && numberPair <= timeIntervals.length) {
            row.numberPair = timeIntervals[numberPair - 1];
          }

          if (row.date) {
            row.date = moment(row.date).locale("ru").format("D MMMM YYYY");
          }
        });

        res.status(200).json(rows);
      }
    }
  );
};