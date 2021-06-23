const { getBuffer } = require("./utils");

module.exports = class Channel {
  constructor(bot, chanId, router, period) {
    this._bot = bot;
    this._chanId = chanId;
    this._router = router;
    this._period = period;
    this._startScheduler();
    console.log("Start channel service");
  }
  _startScheduler() {
    this._timer = setInterval(() => {
      this.sendPhoto();
    }, this._period);
  }
  close() {
    clearInterval(this._timer);
  }
  async sendPhoto() {
    const b = await getBuffer(this._router["next"]().canvas);
    this._bot.sendPhoto(`@${this._chanId}`, b);
  }
};
