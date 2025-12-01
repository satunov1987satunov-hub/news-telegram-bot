import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import express from "express";

dotenv.config();

// Создание Telegram-бота
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true,
});

// Создание Express-сервера (Render без него НЕ работает)
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Логика бота
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  if (!text) return;

  if (text.includes("привет")) {
    return bot.sendMessage(chatId, "Привет! Я работаю 🤖");
  }

  bot.sendMessage(chatId, "Напиши: привет");
});
