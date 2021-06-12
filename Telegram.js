const TelegramBot = require("node-telegram-bot-api");
const { getBuffer } = require("./utils");

module.exports = class Telegram {
  constructor(token, router) {
    this._bot = new TelegramBot(token, { polling: true });
    this._bot.onText(/\/symmetric/, async (msg, match) => {
      const chatId = msg.chat.id;
      const b = await getBuffer(router["symmetric"]());
      this._bot.sendPhoto(chatId, b);
    });
    this._bot.onText(/\/asymmetric/, async (msg, match) => {
      const chatId = msg.chat.id;
      const b = await getBuffer(router["asymmetric"]());
      this._bot.sendPhoto(chatId, b);
    });
  }
  async close() {
    return await this._bot.close();
  }
};
