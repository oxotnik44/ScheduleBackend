const mysql = require('mysql')

const connection = mysql.createPool({
    // host: "172.16.12.247",
    host: "81.1.253.180",
    port:"1248",
    user: "phoneapp",
    password: "niuIUnuio8bi@jju3",
    database: "schedule",
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