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

exports.getScheduleEducator = (req, res) => {
  const { id_prep } = req.body;
  const currentWeek = getWeekNumber();

  db.query(
    `
    SELECT
  'resident' AS scheduleType,
  dek_settings.value AS weekCorrection,
  dek_group_predmet.id AS idPair,
  dek_group_predmet.zal AS comments,
  dek_room.number AS roomNumber,
  NULL AS roomName,
  dek_group.name AS groupName,
  dek_group.id AS idGroup,
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
  FALSE AS isSession,
  NULL AS isActive,
  dek_group_predmet.para AS numberPair,
  dek_cpoints.short AS typePair,
  NULL AS typePairRetake,
  dek_group_predmet.predmet AS namePair,
  NULL AS date
FROM dek_group_predmet
LEFT JOIN dek_group ON dek_group.id = dek_group_predmet.id_group
LEFT JOIN dek_room ON dek_room.id = dek_group_predmet.id_room
LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_group_predmet.lek_sem
LEFT JOIN dek_settings ON dek_settings.parameter = 'week_correction'
LEFT JOIN dek_dep ON dek_dep.id = ${id_prep}
WHERE dek_group_predmet.id_prep = ${id_prep}
  AND dek_group_predmet.day <= 6
  AND dek_group_predmet.chetnechet IN (1, 2)
  AND dek_group.name NOT LIKE '%скрытая%'

    UNION 
    
    SELECT 
  'extramural' AS scheduleType,
    NULL  AS weekCorrection,
  dek_zgroup_predmet.id AS idPair,
  dek_zgroup_predmet.zal AS comments,
  dek_room.number AS roomNumber,
  NULL AS roomName,
  dek_zgroup.name AS groupName,
  dek_zgroup.id AS idGroup,
  NULL AS chetnechet,
  NULL AS weekday,
  FALSE AS isSession,
  dek_zgroup.active AS isActive,
  dek_zgroup_predmet.para AS numberPair,
  dek_cpoints.short AS typePair,
  NULL AS typePairRetake,
  dek_zgroup_predmet.predmet AS namePair,
  dek_zgroup_predmet.date AS date
FROM dek_zgroup_predmet
LEFT JOIN dek_zgroup ON dek_zgroup.id = dek_zgroup_predmet.id_group
LEFT JOIN dek_room ON dek_room.id = dek_zgroup_predmet.id_room
LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_zgroup_predmet.zach_exam
LEFT JOIN dek_settings ON dek_settings.parameter = 'week_correction'

WHERE dek_zgroup_predmet.id_prep = ${id_prep}
  AND dek_zgroup_predmet.id_prep != -1
  AND dek_zgroup_predmet.date >= CURDATE() 
  
  UNION
  SELECT
    'session' AS scheduleType,
    null AS weekCorrection,
    dek_sgroup_predmet.id AS idPair,
    dek_sgroup_predmet.zal AS comments,
    dek_room.number AS roomNumber,
    dek_room.name AS roomName,
    dek_group.name AS groupName,
    dek_group.id AS idGroup,
    NULL AS chetnechet,
    NULL AS weekday,
    TRUE AS isSession,
    NULL AS isActive,
    dek_sgroup_predmet.time AS numberPair,
    dek_cpoints.short AS typePair,
    dek_cpoints.alt AS typePairRetake,
    dek_sgroup_predmet.predmet AS namePair,
    dek_sgroup_predmet.date AS date
FROM dek_sgroup_predmet
LEFT JOIN dek_group ON dek_group.id = dek_sgroup_predmet.id_group
LEFT JOIN dek_room ON dek_room.id = dek_sgroup_predmet.id_room
LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_sgroup_predmet.zach_exam
LEFT JOIN dek_settings ON dek_settings.parameter = 'week_correction'
WHERE dek_sgroup_predmet.id_prep = ${id_prep}
AND (
  (MONTH(CURDATE()) > 8 AND MONTH(dek_sgroup_predmet.date) > 8) OR
  (MONTH(CURDATE()) <= 8 AND MONTH(dek_sgroup_predmet.date) <= 8)
)
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
      const scheduleResident = {
        weekCorrection: rows && rows.length > 0 ? rows[0].weekCorrection : null,
        numerator: [],
        denominator: [],
        session: [],
      };
      const scheduleExtramural = [];
      const extramuralGroupsByDate = {}; // Объект для группировки заочных пар по дате
      const sessionGroups = {};
      const result = {
        extramuralIsActive: false,
        groupType: "", // Инициализируем groupType пустой строкой или значением по умолчанию
        scheduleResident,
        scheduleExtramural,
      };
      if (error) {
        console.log(error);
        res.status(500).json({ error: "Произошла ошибка" });
      } else {
        rows.forEach((row) => {
          const numberPair = row.numberPair;
          if (numberPair >= 1 && numberPair <= timeIntervals.length) {
            row.numberPair = timeIntervals[numberPair - 1];
          }
          if (row.scheduleType === "session") {
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
          // Определение, куда добавлять данные
          if (row.scheduleType === "resident") {
            if (row.chetnechet === 1) {
              scheduleResident.numerator.push(row);
            } else if (row.chetnechet === 2) {
              scheduleResident.denominator.push(row);
            }
          } else if (row.scheduleType === "extramural") {
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
        });

        // Создание блоков с объединенными парыми по дате для заочных
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
exports.getFullScheduleEducatorExtramural = (req, res) => {
  const { id_prep } = req.body;

  db.query(
    `
    SELECT
      dek_zgroup_predmet.id AS idPair,
      dek_zgroup_predmet.zal AS comments,
      dek_room.number AS roomNumber,
      dek_zgroup.id AS idGroup,
      dek_zgroup.name AS groupName,
      NULL AS chetnechet,
      '' AS weekday,
      dek_zgroup_predmet.para AS numberPair,
      dek_cpoints.short AS typePair,
      dek_zgroup_predmet.predmet AS namePair,
      dek_zgroup_predmet.date AS date
    FROM dek_zgroup_predmet
    LEFT JOIN dek_zgroup ON dek_zgroup.id = dek_zgroup_predmet.id_group
    LEFT JOIN dek_room ON dek_room.id = dek_zgroup_predmet.id_room
    LEFT JOIN dek_cpoints ON dek_cpoints.id = dek_zgroup_predmet.zach_exam
    WHERE dek_zgroup_predmet.id_prep = ${id_prep}
      AND dek_zgroup_predmet.id_prep != -1
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
