const express = require("express");
const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;
const jwt = require("jsonwebtoken");

const app = express();
// Настройка passport

passport.use(
  new SamlStrategy(
    {
      path: "/authorization",
      entryPoint: "https://sso.nspu.ru/sso/saml",
      issuer: "your-issuer",
      callbackUrl: "http://your-app/authorization",
    },
    (profile, done) => {
      // Здесь вы можете выполнить дополнительные проверки профиля, если это необходимо
      return done(null, profile);
    }
  )
);
exports.authorization = (req, res) => {
  const { login, password } = req.body;
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
    };
};

passport.serializeUser((user, done) => {
  // В реальном приложении здесь может быть сохранение пользователя в сессии
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // В реальном приложении здесь может быть восстановление пользователя из сессии
  done(null, user);
});

app.use(passport.initialize());