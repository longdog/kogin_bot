process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");

const patternFactory = require("./Pattern");
const Telegram = require("./Telegram");
const Web = require("./Web");
const Channel = require("./Channel");

const { generatePattern, isTrue } = require("./utils");

const DOT = 20;
const GRID_LINE = 1;
const STITCH_LINE = 5;

const [CANVAS_WIDTH, CANVAS_HEIGHT] = [29 * DOT + DOT / 2, 280.5];

const newPattern = patternFactory(
  CANVAS_WIDTH * 2,
  CANVAS_HEIGHT * 2 - DOT,
  DOT,
  STITCH_LINE,
  GRID_LINE
);
// const p = newPattern(generatePattern(false));

// getImage(p.canvas, __dirname + "/test.png");

function startTelegramServices({ token, channel }, router) {
  const bot = new TelegramBot(token, { polling: true });
  new Telegram(bot, router);
  const ch = new Channel(bot, channel, router, 1000 * 60 * 60 * 12);

  return () => {
    ch.close();
  };
}

function startWebService({ port }, router) {
  const w = new Web(port, router);
  return async () => {
    await w.close();
  };
}

function app(config) {
  const router = {
    symmetric: () => newPattern(generatePattern(true)),
    asymmetric: () => newPattern(generatePattern(false)),
    generate: (str) => newPattern(str),
    next: () => newPattern(generatePattern(isTrue())),
  };

  const stopTelegram = startTelegramServices(config, router);
  const stopWeb = startWebService(config, router);

  const cleanup = async () => {
    try {
      stopTelegram();
      await stopWeb();
    } catch (error) {
      console.error("Web service close error", error);
    }
    console.log("Server stoped");
    process.exit(0);
  };

  if (process.platform === "win32") {
    var rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on("SIGINT", () => {
      process.emit("SIGINT");
    });
  }
  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
  process.on("uncaughtException", (err, origin) => {
    console.error(err, origin);
    cleanup();
  });
}

const config = {
  token: process.env["TOKEN"],
  channel: process.env["CHANNEL"],
  port: process.env["PORT"],
};
app(config);
