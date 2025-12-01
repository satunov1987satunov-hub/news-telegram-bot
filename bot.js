import dotenv from "dotenv";
import express from "express";
import { Telegraf } from "telegraf";

dotenv.config();

// Берём токен бота из переменной окружения
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN не задан в переменных окружения");
  process.exit(1);
}

// Создаём бота (polling-режим, без вебхуков)
const bot = new Telegraf(token);

// Команда /start
bot.start((ctx) => {
  ctx.reply(
    "👋 Привет! Я бот.\n\n" +
    "Напиши: *привет* — я отвечу.\n" +
    "Напиши: */news* — пока тестовый ответ про новости.",
    { parse_mode: "Markdown" }
  );
});

// Любой текст
bot.on("text", (ctx) => {
  const text = (ctx.message.text || "").toLowerCase();

  if (text.includes("привет")) {
    return ctx.reply("Привет! Я работаю 🤖");
  }

  if (text === "/news" || text.startsWith("/news")) {
    return ctx.reply("Пока я только тестовый бот. Скоро научусь сам искать новости 😉");
  }

  ctx.reply("Я тебя понял. Напиши: привет или /news");
});

// Запускаем бота в polling-режиме
bot
  .launch()
  .then(() => {
    console.log("✅ Bot started in polling mode");
  })
  .catch((err) => {
    console.error("❌ Error starting bot:", err);
  });

// Корректная остановка
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// Express-сервер для Render (просто чтобы было, что слушать на порту)
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`🌐 Server started on port ${PORT}`);
});
