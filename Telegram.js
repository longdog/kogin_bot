const TelegramBot = require("node-telegram-bot-api");
const { getBuffer } = require("./utils");

module.exports = class Telegram {
  constructor(token, router) {
    this._bot = new TelegramBot(token, { polling: true });
    this._bot.onText(/\/symmetric/, async (msg, match) => {
      const chatId = msg.chat.id;
      const b = await getBuffer(router["symmetric"]().canvas);
      this._bot.sendPhoto(chatId, b);
    });
    this._bot.onText(/\/asymmetric/, async (msg, match) => {
      const chatId = msg.chat.id;
      const b = await getBuffer(router["asymmetric"]().canvas);
      this._bot.sendPhoto(chatId, b);
    });
    this._bot.onText(/(^0.*\n)+/, async (msg, match) => {
      const chatId = msg.chat.id;
      let c = undefined;
      try {
        c = router["generate"](match.input).canvas;
      } catch (error) {
        this._bot.sendMessage(chatId, error.message);
        return;
      }
      const b = await getBuffer(c);
      this._bot.sendPhoto(chatId, b);
    });
    console.log("Start telegram service");
  }
};
