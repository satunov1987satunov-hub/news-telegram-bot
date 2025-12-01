import dotenv from "dotenv";
import express from "express";
import { Telegraf } from "telegraf";

dotenv.config();

// Создаём Telegram-бота
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Обработка команд
bot.start((ctx) => {
  ctx.reply("Бот запущен! Напиши: привет");
});

bot.on("text", (ctx) => {
  const text = ctx.message.text.toLowerCase();

  if (text.includes("привет")) {
    return ctx.reply("Привет! Я работаю 🤖");
  }

  ctx.reply("Напиши: привет");
});

// Создаём Express-сервер (для Render обязательно)
const app = express();
const PORT = process.env.PORT || 3000;

// Вебхук
app.use(bot.webhookCallback("/webhook"));

bot.telegram.setWebhook(`https://${process.env.RENDER_EXTERNAL_URL}/webhook`);

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
