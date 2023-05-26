const mysql = require('mysql')

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "Schedule",
})

connection.getConnection((err, conn) => {
    if (err) {
        console.error("Ошибка подключения к базе данных MySQL:", err);
        return;
    }
    console.log("Подключение к базе данных MySQL успешно установлено");
    conn.release(); // Важно освободить соединение после успешного подключения
});

module.exports = connection