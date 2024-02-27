const express = require("express");
const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;
const jwt = require("jsonwebtoken");
const { secret } = require("./config");
const generateAccessToken = () => {
  const payload = {
    // Пример использования текущей даты в качестве идентификатора
    timestamp: new Date().toISOString(),
  };
  return jwt.sign(payload, secret, { expiresIn: "1y" });
};
const app = express();

// passport.use(
//   new SamlStrategy(
//     {
//       // ... другие параметры ...
//       callbackUrl: "http://83.234.107.43:5000/loginUser/callback",
//       // Установите ACS URL
//       acceptedSsoBindings: ["urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"],
//       identifierFormat: null,
//       disableRequestedAuthnContext: true,
//       // Установите SLS URL
//       logoutUrl: "http://83.234.107.43:5000/logoutUser",
//       // ... другие параметры ...
//       cert: "MIID/TCCAuWgAwIBAgIJAI4R3WyjjmB1MA0GCSqGSIb3DQEBCwUAMIGUMQswCQYDVQQGEwJBUjEVMBMGA1UECAwMQnVlbm9zIEFpcmVzMRUwEwYDVQQHDAxCdWVub3MgQWlyZXMxDDAKBgNVBAoMA1NJVTERMA8GA1UECwwIU2lzdGVtYXMxFDASBgNVBAMMC09yZy5TaXUuQ29tMSAwHgYJKoZIhvcNAQkBFhFhZG1pbmlAc2l1LmVkdS5hcjAeFw0xNDEyMDExNDM2MjVaFw0yNDExMzAxNDM2MjVaMIGUMQswCQYDVQQGEwJBUjEVMBMGA1UECAwMQnVlbm9zIEFpcmVzMRUwEwYDVQQHDAxCdWVub3MgQWlyZXMxDDAKBgNVBAoMA1NJVTERMA8GA1UECwwIU2lzdGVtYXMxFDASBgNVBAMMC09yZy5TaXUuQ29tMSAwHgYJKoZIhvcNAQkBFhFhZG1pbmlAc2l1LmVkdS5hcjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMbzW/EpEv+qqZzfT1Buwjg9nnNNVrxkCfuR9fQiQw2tSouS5X37W5h7RmchRt54wsm046PDKtbSz1NpZT2GkmHN37yALW2lY7MyVUC7itv9vDAUsFr0EfKIdCKgxCKjrzkZ5ImbNvjxf7eA77PPGJnQ/UwXY7W+cvLkirp0K5uWpDk+nac5W0JXOCFR1BpPUJRbz2jFIEHyChRt7nsJZH6ejzNqK9lABEC76htNy1Ll/D3tUoPaqo8VlKW3N3MZE0DB9O7g65DmZIIlFqkaMH3ALd8adodJtOvqfDU/A6SxuwMfwDYPjoucykGDu1etRZ7dF2gd+W+1Pn7yizPT1q8CAwEAAaNQME4wHQYDVR0OBBYEFPsn8tUHN8XXf23ig5Qro3beP8BuMB8GA1UdIwQYMBaAFPsn8tUHN8XXf23ig5Qro3beP8BuMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAGu60odWFiK+DkQekozGnlpNBQz5lQ/bwmOWdktnQj6HYXu43e7sh9oZWArLYHEOyMUekKQAxOK51vbTHzzw66BZU91/nqvaOBfkJyZKGfluHbD0/hfOl/D5kONqI9kyTu4wkLQcYGyuIi75CJs15uA03FSuULQdY/Liv+czS/XYDyvtSLnu43VuAQWN321PQNhuGueIaLJANb2C5qq5ilTBUw6PxY9Z+vtMjAjTJGKEkE/tQs7CvzLPKXX3KTD9lIILmX5yUC3dLgjVKi1KGDqNApYGOMtjr5eoxPQrqDBmyx3flcy0dQTdLXud3UjWVW3N0PYgJtw5yBsS74QTGD4=",
//     },
//     (profile, done) => {
//       // ... дополнительные проверки профиля ...
//       return done(null, profile);
//     }
//   )
// );

app.use(passport.initialize());

app.post(
  "/login/callback",
  passport.authenticate("saml", { session: false }),
  (req, res) => {
    // Если аутентификация успешна, создаем токен и отправляем его приложению
    const user = req.user; // Предполагая, что профиль пользователя сохранен в req.user в результате аутентификации
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      "your_secret_key",
      { expiresIn: "1h" }
    );
    res.json({ token });
  }
);

// Маршрут для обработки SAML SLS (выход из системы)
app.post("/logout", (req, res) => {
  // Реализуйте логику для завершения сеанса пользователя
  // Например, удаление сессии, очистка токенов и т.д.
  res.send("Logout successful");
});

exports.authorization = (req, res) => {
  // Генерация токена без явного идентификатора пользователя
  const token = generateAccessToken();

  // Ваш код дальше, например, отправка токена в ответе
  res.json({ token });
};
