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

// Создаём бота (Telegraf)
const bot = new Telegraf(token);

// ==== ХЕНДЛЕРЫ БОТА ====

// /start
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

// ==== ЗАПУСК БОТА В POLLING-РЕЖИМЕ ====
// Удаляем старый webhook и включаем polling
(async () => {
  try {
    await bot.telegram.deleteWebhook();
    console.log("✅ Webhook удалён, переключаюсь на polling...");
    await bot.launch();
    console.log("✅ Bot started in polling mode");
  } catch (err) {
    console.error("❌ Ошибка при запуске бота:", err);
  }
})();

// Корректная остановка
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// ==== EXPRESS-СЕРВЕР ДЛЯ RENDER ====
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`🌐 Server started on port ${PORT}`);
});
