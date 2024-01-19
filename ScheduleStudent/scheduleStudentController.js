"use strict";
const db = require("../db");
const moment = require("moment");

function getWeekNumber() {
  const currentDate = moment();
  const startOfYear = moment().startOf("year");
  const weekNumber = currentDate.diff(startOfYear, "weeks") + 1;
  return weekNumber;
}
exports.getIsActive = (req, res) => {
  const { id_group } = req.body;
  db.query(
    `SELECT dek_zgroup.active AS extramuralIsActive
    FROM dek_zgroup WHERE id = ${id_group}
    `,
    (error, rows) => {
      if (error) {
        console.log(error);
      } else {
        if (rows.length > 0) {
          const isActive = rows[0].extramuralIsActive === 1 ? true : false;
          res.status(200).json(isActive); // Отправляем true или false
        } else {
          res.status(200).json(null); // Возвращаем null, если нет данных
        }
      }
    }
  );
};
exports.getScheduleStudent = (req, res) => {
  const { id_group, name } = req.body;
  const currentWeek = getWeekNumber();
  const nextWeek = currentWeek === 4 ? 1 : currentWeek + 1;

  db.query(
    `SELECT * FROM (
      (
          SELECT
              'resident' AS groupType,
              dek_settings.value AS weekCorrection,
              dek_group_predmet.id AS idPair,
              dek_group.name AS nameGroup,
              dek_group_predmet.zal AS comments,
              dek_room.number AS roomNumber,
              NULL AS roomName,
              CASE
                  WHEN dek_group_predmet.chetnechet IN (1, 2) THEN dek_group_predmet.chetnechet
                  ELSE NULL
              END AS chetnechet,
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
              FALSE AS isSession,
              NULL AS isActive,
              dek_group_predmet.para AS numberPair,
              dek_cpoints.short AS typePair,
              NULL AS typePairRetake,
              dek_group_predmet.predmet AS namePair,
              CONCAT(
                  SUBSTRING_INDEX(dek_prepod.name, ' ', 1),
                  ' ',
                  UPPER(LEFT(SUBSTRING_INDEX(dek_prepod.name, ' ', -2), 1)),
                  '.',
                  UPPER(LEFT(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 1)),
                  '.'
              ) AS nameEducator,
              dek_prepod.name AS fullNameEducator,
              dek_group_predmet.id_prep AS idEducator,
              dek_prepod.regalia AS regaliaEducator,
              NULL AS date,
              CASE
                  WHEN dek_group_predmet.chetnechet IN (1, 2) THEN ${currentWeek}
                  ELSE ${nextWeek}
              END AS weekNumber,
              FIELD(dek_group_predmet.day, 1, 2, 3, 4, 5, 6, 7) AS orderWeekday
          FROM dek_group_predmet
          LEFT JOIN dek_prepod ON dek_prepod.id = dek_group_predmet.id_prep
          LEFT JOIN dek_room ON dek_room.id = dek_group_predmet.id_room
          LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_group_predmet.lek_sem
          LEFT JOIN dek_settings ON dek_settings.parameter = 'week_correction'
          LEFT JOIN dek_group ON dek_group.id = ${id_group}
          WHERE dek_group_predmet.id_group = ${id_group}
              AND dek_group.name = '${name}'
      )
      UNION
      (
          SELECT
              'extramural' AS groupType,
              null AS weekCorrection,
              dek_zgroup_predmet.id AS idPair,
              dek_zgroup.name AS nameGroup,
              dek_zgroup_predmet.zal AS comments,
              dek_room.number AS roomNumber,
              NULL AS roomName,
              NULL AS chetnechet,
              NULL AS weekday,
              FALSE AS isSession,
              dek_zgroup.active AS isActive,
              dek_zgroup_predmet.para AS numberPair,
              dek_cpoints.short AS typePair,
              NULL AS typePairRetake,
              dek_zgroup_predmet.predmet AS namePair,
              CONCAT(
                  SUBSTRING_INDEX(dek_prepod.name, ' ', 1),
                  ' ',
                  UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -2), 1, 1)),
                  '.',
                  UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 1, 1))
              ) AS nameEducator,
              dek_prepod.name AS fullNameEducator,
              dek_zgroup_predmet.id_prep AS idEducator,
              dek_prepod.regalia AS regaliaEducator,
              dek_zgroup_predmet.date AS date,
              ${currentWeek} AS weekNumber,
              NULL AS orderWeekday
          FROM dek_zgroup_predmet
          LEFT JOIN dek_prepod ON dek_prepod.id = dek_zgroup_predmet.id_prep
          LEFT JOIN dek_room ON dek_room.id = dek_zgroup_predmet.id_room
          LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_zgroup_predmet.zach_exam
          LEFT JOIN dek_zgroup ON dek_zgroup.id = ${id_group}
          WHERE dek_zgroup_predmet.id_group = ${id_group}
              ${id_group == 3430 ? "" : "AND dek_zgroup_predmet.id_prep != -1"}
              AND dek_zgroup_predmet.date >= CURDATE() -- Добавляем условие для текущей даты
              AND dek_zgroup.name = '${name}'
      )
      UNION
      (
          SELECT
              'session' AS groupType,
              null AS weekCorrection,
              dek_sgroup_predmet.id AS idPair,
              NULL AS nameGroup,
              dek_sgroup_predmet.zal AS comments,
              dek_room.number AS roomNumber,
              dek_room.name AS roomName,
              NULL AS chetnechet,
              NULL AS weekday,
              TRUE AS isSession,
              NULL AS isActive,
              dek_sgroup_predmet.time AS numberPair,
              dek_cpoints.short AS typePair,
              dek_cpoints.alt AS typePairRetake,
              dek_sgroup_predmet.predmet AS namePair,
              CONCAT(
                  SUBSTRING_INDEX(dek_prepod.name, ' ', 1),
                  ' ',
                  UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -2), 1, 1)),
                  '.',
                  UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 1, 1))
              ) AS nameEducator,
              dek_prepod.name AS fullNameEducator,
              dek_sgroup_predmet.id_prep AS idEducator,
              dek_prepod.regalia AS regaliaEducator,
              dek_sgroup_predmet.date AS date,
              NULL AS weekNumber,
              NULL AS orderWeekday
          FROM dek_sgroup_predmet
          LEFT JOIN dek_prepod ON dek_prepod.id = dek_sgroup_predmet.id_prep
          LEFT JOIN dek_room ON dek_room.id = dek_sgroup_predmet.id_room
          LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_sgroup_predmet.zach_exam
          WHERE dek_sgroup_predmet.id_group = ${id_group}
          AND (
            (MONTH(CURDATE()) > 8 AND MONTH(dek_sgroup_predmet.date) > 8) OR
            (MONTH(CURDATE()) <= 8 AND MONTH(dek_sgroup_predmet.date) <= 8)
          )
        
      )
      UNION
      (
          SELECT
              'active' AS groupType,
              null AS weekCorrection,
              NULL AS idPair,
              NULL AS nameGroup,
              NULL AS comments,
              NULL AS roomNumber,
              NULL AS roomName,
              NULL AS chetnechet,
              NULL AS weekday,
              NULL AS isSession,
              dek_zgroup.active AS isActive,
              NULL AS numberPair,
              NULL AS typePair,
              NULL AS typePairRetake,
              NULL AS namePair,
              NULL AS nameEducator,
              NULL AS fullNameEducator,
              NULL AS idEducator,
              NULL AS regaliaEducator,
              NULL AS date,
              NULL AS weekNumber,
              NULL AS orderWeekday
          FROM dek_zgroup
          WHERE dek_zgroup.id = ${id_group}
      )
  ) AS combinedResult
  ORDER BY 
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
        const scheduleResident = {
          weekCorrection: rows.length > 0 ? rows[0].weekCorrection : null,
          numerator: [],
          denominator: [],
          session: [],
        };
        const scheduleExtramural = [];
        const extramuralGroupsByDate = {};
        const sessionGroups = {};
        const result = {
          extramuralIsActive: false,
          groupType: "", // Инициализируем groupType пустой строкой или значением по умолчанию
          scheduleResident,
          scheduleExtramural,
        };
        rows.forEach((row) => {
          console.log(row.isActive)
          if (row.groupType === "active" && row.isActive) {
            result.extramuralIsActive = true; // Устанавливаем флаг, если находим хотя бы один isActive = true
          }
          const numberPair = row.numberPair;
          if (numberPair >= 1 && numberPair <= timeIntervals.length) {
            row.numberPair = timeIntervals[numberPair - 1];
          }
          if (row.groupType === "session") {
            row.date = moment(row.date).locale("ru").format("D MMMM YYYY");
            if (row.isSession) {
              const formattedNumberPair = moment(row.numberPair, [
                "HH:mm",
                "HH.mm",
                "HH-mm",
              ]).format("HH:mm");

              row.numberPair = formattedNumberPair;

              if (row.typePairRetake) {
                row.typePairRetake = row.typePairRetake.replace(
                  /<\/?i>|<\/?b>/g,
                  ""
                );
              }

              if (!sessionGroups[row.date]) {
                sessionGroups[row.date] = [];
              }
              sessionGroups[row.date].push(row);
            }
          } 
          if (row.groupType === "extramural" && row.nameGroup === name) {
            result.groupType = "extramural";
            if (row.isActive) {
              result.extramuralIsActive = true;
            }
            if (row.date) {
              row.date = moment(row.date).locale("ru").format("D MMMM YYYY");
              if (!extramuralGroupsByDate[row.date]) {
                extramuralGroupsByDate[row.date] = [];
              }

              extramuralGroupsByDate[row.date].push(row);
            }
          } else if (row.groupType === "extramural") {
            result.groupType = "extramural";
            if (row.isActive) {
              result.extramuralIsActive = true;
            }
            if (row.date) {
              row.date = moment(row.date).locale("ru").format("D MMMM YYYY");
              if (!extramuralGroupsByDate[row.date]) {
                extramuralGroupsByDate[row.date] = [];
              }

              extramuralGroupsByDate[row.date].push(row);
            }
          }
          if (row.groupType === "resident" && row.nameGroup === name) {
            result.groupType = "resident";
            if (row.weekday) {
              if (
                (row.chetnechet === 1 && row.weekNumber === currentWeek) ||
                (row.chetnechet === 2 && row.weekNumber === currentWeek) ||
                (row.chetnechet === 1 && row.weekNumber === nextWeek) ||
                (row.chetnechet === 2 && row.weekNumber === nextWeek)
              ) {
                if (row.chetnechet === 1) {
                  scheduleResident.numerator.push(row);
                } else {
                  scheduleResident.denominator.push(row);
                }
              }
            }
          } else if (row.groupType === "resident") {

            result.groupType = "resident";

            if (row.weekday) {
              if (
                (row.chetnechet === 1 && row.weekNumber === currentWeek) ||
                (row.chetnechet === 2 && row.weekNumber === currentWeek) ||
                (row.chetnechet === 1 && row.weekNumber === nextWeek) ||
                (row.chetnechet === 2 && row.weekNumber === nextWeek)
              ) {
                if (row.chetnechet === 1) {
                  scheduleResident.numerator.push(row);
                } else {
                  scheduleResident.denominator.push(row);
                }
              }
            }
          }
        });

        Object.entries(extramuralGroupsByDate).forEach(([date, schedule]) => {
          scheduleExtramural.push({
            date,
            schedule,
          });
        });
        Object.entries(sessionGroups).forEach(([date, schedule]) => {
          scheduleResident.session.push({
            date,
            schedule,
          });
        });

        res.status(200).json(result);
      }
    }
  );
};

exports.getFullScheduleStudentExtramuralist = (req, res) => {
  const { id_group } = req.body;

  db.query(
    `
    SELECT
      dek_zgroup_predmet.id AS idPair,
      dek_zgroup_predmet.zal AS comments,
      dek_room.number AS roomNumber,
      NULL AS chetnechet,
      dek_zgroup_predmet.para AS numberPair,
      dek_cpoints.short AS typePair,
      dek_zgroup_predmet.predmet AS namePair,
      CONCAT(
        SUBSTRING_INDEX(dek_prepod.name, ' ', 1),
        ' ',
        UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -2), 1, 1)),
        '.',
        UPPER(SUBSTRING(SUBSTRING_INDEX(dek_prepod.name, ' ', -1), 1, 1))
      ) AS nameEducator,
      dek_prepod.name AS fullNameEducator,
      dek_zgroup_predmet.id_prep AS idEducator,
      dek_prepod.regalia AS regaliaEducator,
      dek_zgroup_predmet.date AS date
    FROM dek_zgroup_predmet
    LEFT JOIN dek_prepod ON dek_prepod.id = dek_zgroup_predmet.id_prep
    LEFT JOIN dek_room ON dek_room.id = dek_zgroup_predmet.id_room
    LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_zgroup_predmet.zach_exam
    WHERE dek_zgroup_predmet.id_group = ${id_group}
    ${id_group == 3430 ? "" : "AND dek_zgroup_predmet.id_prep != -1"}
      AND dek_zgroup_predmet.date 
    ORDER BY 
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
        const scheduleExtramural = [];
        const extramuralGroupsByDate = {};

        rows.forEach((row) => {
          const numberPair = row.numberPair;
          if (numberPair >= 1 && numberPair <= timeIntervals.length) {
            row.numberPair = timeIntervals[numberPair - 1];
          }

          if (row.date) {
            row.date = moment(row.date).locale("ru").format("D MMMM YYYY");
            if (!extramuralGroupsByDate[row.date]) {
              extramuralGroupsByDate[row.date] = [];
            }
            extramuralGroupsByDate[row.date].push(row);
          }
        });
        Object.entries(extramuralGroupsByDate).forEach(([date, schedule]) => {
          scheduleExtramural.push({
            date,
            schedule,
          });
        });

        res.status(200).json(scheduleExtramural);
      }
    }
  );
};
