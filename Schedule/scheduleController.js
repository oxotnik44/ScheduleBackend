"use strict";
const db = require("../db");
const moment = require("moment");

function getWeekNumber() {
  const currentDate = moment();
  const startOfYear = moment().startOf("year");
  const weekNumber = currentDate.diff(startOfYear, "weeks") + 1;
  return weekNumber;
}

exports.getSchedule = (req, res) => {
  const { id_group } = req.body;
  const currentWeek = getWeekNumber();
  const isEvenWeek = currentWeek % 2 === 0;
  const nextWeek = currentWeek === 4 ? 1 : currentWeek + 1;


  db.query(
    `SELECT
      dek_group_predmet.id AS idPair,
      dek_room.number AS roomNumber,
      dek_group_predmet.chetnechet,
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
      dek_prepod.regalia AS regaliaEducator,
      NULL AS date,
      ${currentWeek} AS weekNumber
    FROM dek_group_predmet
    LEFT JOIN dek_prepod ON dek_prepod.id = dek_group_predmet.id_prep
    LEFT JOIN dek_room ON dek_room.id = dek_group_predmet.id_room
    LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_group_predmet.lek_sem
    WHERE dek_group_predmet.id_group = ${id_group}
      AND dek_group_predmet.id_prep != -1
      AND dek_group_predmet.chetnechet IN (1, 2)
  
    UNION
  
    SELECT
      dek_zgroup_predmet.id AS idPair,
      dek_room.number AS roomNumber,
      NULL AS chetnechet,
      '' AS weekday,
      dek_zgroup_predmet.para AS numberPair,
      dek_cpoints.short AS typePair,
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
      dek_prepod.regalia AS regaliaEducator,
      dek_zgroup_predmet.date AS date,
      ${nextWeek} AS weekNumber
    FROM dek_zgroup_predmet
    LEFT JOIN dek_prepod ON dek_prepod.id = dek_zgroup_predmet.id_prep
    LEFT JOIN dek_room ON dek_room.id = dek_zgroup_predmet.id_room
    LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_zgroup_predmet.zach_exam
    WHERE dek_zgroup_predmet.id_group = ${id_group}
      AND dek_zgroup_predmet.id_prep != -1
      AND dek_zgroup_predmet.date >= CURDATE()
      AND dek_zgroup_predmet.date < CURDATE() + INTERVAL 1 WEEK
    ORDER BY date ASC, numberPair ASC`,
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
        const filteredRows = rows.filter((row) => {
          if (row.chetnechet === 1 && row.weekNumber === currentWeek) {
            return true;
          }
          if (row.chetnechet === 2 && row.weekNumber === currentWeek) {
            return true;
          }
          if (row.chetnechet === 1 && row.weekNumber === nextWeek) {
            return true;
          }
          if (row.chetnechet === 2 && row.weekNumber === nextWeek) {
            return true;
          }
          return false;
        });

        filteredRows.forEach((row) => {
          const numberPair = row.numberPair;
          if (numberPair >= 1 && numberPair <= timeIntervals.length) {
            row.numberPair = timeIntervals[numberPair - 1];
          }

          if (row.date) {
            row.date = moment(row.date).locale("ru").format("D MMMM YYYY");
          }
        });

        const schedule = {
          even: [],
          odd: [],
        };

        filteredRows.forEach((row) => {
          if (row.chetnechet === 1 && row.weekNumber === currentWeek) {
            schedule.even.push(row);
          } else if (row.chetnechet === 2 && row.weekNumber === currentWeek) {
            schedule.odd.push(row);
          } else if (row.chetnechet === 1 && row.weekNumber === nextWeek) {
            schedule.even.push(row);
          } else if (row.chetnechet === 2 && row.weekNumber === nextWeek) {
            schedule.odd.push(row);
          }
        });
  
        const result = {
          schedule,
        };

        res.status(200).json(result);
      }
    }
  );
};
