import dotenv from "dotenv";
import express from "express";
import { Telegraf } from "telegraf";
import axios from "axios";

dotenv.config();

// 🔑 Токен бота из переменных окружения
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// ===== ФУНКЦИЯ ПОЛУЧЕНИЯ НОВОСТИ =====
const NEWS_RSS_URL =
  process.env.NEWS_RSS_URL || "https://lenta.ru/rss/news"; // можно поменять на любой RSS

async function getLatestNews() {
  try {
    const { data } = await axios.get(NEWS_RSS_URL, { timeout: 5000 });

    // Берём первый <item> из RSS
    const itemMatch = data.match(/<item>[\s\S]*?<\/item>/);
    if (!itemMatch) return null;
    const item = itemMatch[0];

    // Заголовок
    const titleMatch =
      item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
      item.match(/<title>(.*?)<\/title>/);
    const title = (titleMatch && (titleMatch[1] || titleMatch[2]))?.trim();

    // Описание
    const descMatch =
      item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
      item.match(/<description>(.*?)<\/description>/);
    let description = (descMatch && (descMatch[1] || descMatch[2])) || "";
    // убираем HTML-теги
    description = description.replace(/<\/?[^>]+(>|$)/g, "").trim();

    // Ссылка
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    const link = linkMatch && linkMatch[1];

    return { title, description, link };
  } catch (e) {
    console.error("News error:", e.message);
    return null;
  }
}

// ===== ОБРАБОТЧИКИ БОТА =====

// /start
bot.start((ctx) => {
  ctx.reply(
    "👋 Привет! Я новостной бот.\n\n" +
      "Команды:\n" +
      "• /news — свежая новость\n" +
      "• просто напиши: привет"
  );
});

// привет / любое сообщение
bot.on("text", async (ctx) => {
  const text = ctx.message.text.toLowerCase();

  if (text.includes("привет")) {
    return ctx.reply("Привет! Я работаю 🤖\nНапиши /news — покажу свежую новость.");
  }

  if (text === "/news" || text.startsWith("/news ")) {
    const news = await getLatestNews();
    if (!news || !news.title) {
      return ctx.reply("Не смог найти новости 😔 Попробуй позже.");
    }

    let msg = `📰 *${news.title}*\n\n${news.description}`;
    if (news.link) msg += `\n\nПодробнее: ${news.link}`;
    return ctx.reply(msg, { parse_mode: "Markdown" });
  }

  return ctx.reply("Я пока умею: /news и привет 😊");
});

// ===== EXPRESS + WEBHOOK ДЛЯ RENDER =====
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bot.webhookCallback("/webhook"));

bot.telegram.setWebhook(`https://${process.env.RENDER_EXTERNAL_URL}/webhook`);

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
