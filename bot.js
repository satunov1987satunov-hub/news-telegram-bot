import dotenv from "dotenv";
import express from "express";
import { Telegraf } from "telegraf";

dotenv.config();

// === Telegram-бот ===
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// /start
bot.start((ctx) => {
  ctx.reply("Бот запущен! Напиши: привет или /news");
});

// Любой текст
bot.on("text", (ctx) => {
  const text = ctx.message.text.toLowerCase();

  if (text.includes("привет")) {
    return ctx.reply("Привет! Я работаю 🤖");
  }

  if (text === "/news" || text.includes("новост")) {
    return ctx.reply("Пока я только тестовый бот. Скоро научусь искать новости 😉");
  }

  ctx.reply("Я тебя понял. Напиши: привет или /news");
});

// === Express-сервер для Render ===
const app = express();
const PORT = process.env.PORT || 3000;

// Webhook для Telegram
app.use(bot.webhookCallback("/webhook"));

bot.telegram.setWebhook(
  `https://${process.env.RENDER_EXTERNAL_URL}/webhook`
);

// Проверка в браузере
app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
