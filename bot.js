import express from "express";
import axios from "axios";
import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";

const app = express();

// Эти значения Render возьмёт из Secrets
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Создаём Telegram-бота
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Функция получения новости
async function getNews() {
  try {
    const res = await axios.get(
      "https://newsapi.org/v2/top-headlines?country=us&apiKey=4b27d1d57b154779bf79a30486c3a9e7"
    );
    const article = res.data.articles[0];

    return `📰 *${article.title}*\n\n${article.description}\n\nИсточник: ${article.url}`;
  } catch (err) {
    return "❌ Ошибка получения новостей.";
  }
}

// Команда /start
bot.onText(/\/start/, async (msg) => {
  bot.sendMessage(msg.chat.id, "Бот активирован! Новости будут приходить автоматически.");
});

// Автоматическая отправка новости каждый час
cron.schedule("0 * * * *", async () => {
  const news = await getNews();
  await bot.sendMessage(CHAT_ID, news, { parse_mode: "Markdown" });
});

// Сервер для Render
app.get("/", (req, res) => {
  res.send("Telegram news bot is running!");
});

// Render запускает сервер на порту 10000
app.listen(10000, () => console.log("Server started on port 10000"));
