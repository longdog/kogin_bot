process.env.NTBA_FIX_319 = 1;

const patternFactory = require("./Pattern");
const Telegram = require("./Telegram");
const Web = require("./Web");

const { generatePattern } = require("./utils");

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

const router = {
  symmetric: () => {
    return newPattern(generatePattern(true));
  },
  asymmetric: () => {
    return newPattern(generatePattern(false));
  },
  generate: (str) => {
    return newPattern(str);
  },
};

function app() {
  // const token = process.env["TOKEN"];
  // const t = new Telegram(token, router);
  const w = new Web(8000, router);

  const cleanup = async () => {
    await w.close();
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
  ///https://gist.github.com/rla/2689424
  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
}

app();
