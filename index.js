process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const { patternNodeFactory, patternGenerator } = require("koginlib");

const Telegram = require("./Telegram");
const Web = require("./Web");
const Channel = require("./Channel");

const { isTrue } = require("./utils");

const DOT = 20;
const STITCH_LINE = 5;

const [CANVAS_WIDTH, CANVAS_HEIGHT] = [29 * DOT + DOT / 2, 280.5];

const canvasSize = {
  width: CANVAS_WIDTH * 2,
  height: CANVAS_HEIGHT * 2 - DOT,
};

const stitch = {
  stitchStep: DOT,
  stitchWeight: STITCH_LINE,
};

const pattern = patternNodeFactory(canvasSize, stitch);

function startTelegramServices({ token, channel }, router) {
  const bot = new TelegramBot(token, { polling: true });
  const t = new Telegram(bot, router);
  t.start();
  const ch = new Channel(bot, channel, router, 1000 * 60 * 60 * 12);
  ch.start();
  return async () => {
    await ch.close();
  };
}

function startWebService({ port }, router) {
  const w = new Web(port, router);
  return async () => {
    await w.close();
  };
}

function gracefulStop(cleanup) {
  let status = 0;
  const clean = () => {
    cleanup();
    setTimeout(() => process.exit(status), 2000);
  };
  if (process.platform === "win32") {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on("SIGINT", () => {
      process.emit("SIGINT");
    });
  }
  process.on("SIGTERM", clean);
  process.on("SIGINT", clean);
  process.on("uncaughtException", (err, origin) => {
    console.error(err, origin);
    status = 1;
    clean();
  });
}

const config = {
  token: process.env["TOKEN"],
  channel: process.env["CHANNEL"],
  port: process.env["PORT"],
};

const g = patternGenerator(pattern, true);

const routerConfig = {
  symmetric: () => {
    return g(true).next().value;
  },
  asymmetric: () => g(false).next().value,
  generate: (str) => pattern(str, true),
  next: () => g(isTrue()).next().value,
};
if (numCPUs > 1) {
  if (cluster.isMaster) {
    console.log(`Primary ${process.pid} is running`);
    var workers = {};
    process.title = "kogin";

    const cleanup = () => {
      console.log("Master stopping.");

      for (let pid in workers) {
        workers[pid].kill();
      }
    };

    let isFirst = true;
    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork();
      workers[worker.process.pid] = worker;
      if (isFirst) {
        worker.process.title = "telegram";
        worker.send({ name: "telegram" });
        isFirst = false;
      } else {
        worker.process.title = "web";
        worker.send({ name: "web" });
      }
    }
    cluster.on("exit", (worker) => {
      console.log(`worker ${worker.process.title} died`);
    });
    gracefulStop(cleanup);
  } else {
    console.log(`Worker ${process.pid} is running`);
    let close = undefined;
    process.on("message", (message) => {
      if (message.name === "telegram") {
        console.log("TELEGRAM");
        process.title = "telegram";
        close = startTelegramServices(config, routerConfig);
      } else {
        console.log("WEB");
        process.title = "web";
        close = startWebService(config, routerConfig);
      }
    });
    process.on("exit", async () => {
      console.log("Stopping worker " + process.pid);
      if (close) {
        await close();
      }
    });
  }
} else {
  const stopTelegram = startTelegramServices(config, routerConfig);
  const stopWeb = startWebService(config, routerConfig);
  const cleanup = async () => {
    try {
      await stopTelegram();
      await stopWeb();
    } catch (error) {
      console.error("Service close error", error);
    }
    console.log("Server stoped");
  };
  gracefulStop(cleanup);
}
