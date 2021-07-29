const { setInterval } = require("timers/promises");

const { getBuffer } = require("./utils");

module.exports = class Channel {
  constructor(bot, chanId, router, period) {
    this._bot = bot;
    this._chanId = chanId;
    this._router = router;
    this._period = period;
  }
  start() {
    this._startScheduler();
    console.log("Start channel service");
  }
  _startScheduler() {
    this._stopTimer = new AbortController();
    setInterval(this._period, this.sendPhoto, {
      signal: this._stopTimer.signal,
    });
    // this._timer = setInterval(() => {
    //   this.sendPhoto();
    // }, this._period);
  }
  async close() {
    //clearInterval(this._timer);
    this._stopTimer.abort();
  }
  async sendPhoto() {
    const b = await getBuffer(this._router["next"]().canvas);
    this._bot.sendPhoto(`@${this._chanId}`, b);
  }
};
