"use strict";

const jwt = require("jsonwebtoken");
const db = require("../db");

exports.authorization = async (req, res) => {
    try {
        const { login, password } = req.body;

        // Здесь выполняется проверка авторизации в базе данных
        // Например:
        const user = await db.User.findOne({ login, password });

        if (!user) {
            return res.status(401).json({ message: "Неверный логин или пароль" });
        }

        // Генерация токена
        const token = jwt.sign({ userId: user._id }, "секретный_ключ", { expiresIn: "1h" });

        // Если пользователь найден, возвращаем успешный ответ с токеном
        return res.status(200).json({ message: "Авторизация успешна", token });
    } catch (error) {
        // Если произошла ошибка при выполнении запроса к базе данных или другая ошибка
        return res.status(500).json({ message: "Произошла ошибка при авторизации", error: error.message });
    }
};
