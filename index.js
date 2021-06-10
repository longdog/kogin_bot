const { createCanvas } = require("canvas");
process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const DOT = 20;
const GRID_LINE = 1;
const STITCH_LINE = 5;

const isDraw = () => {
  return Math.random() >= 0.5;
};

const [CANVAS_WIDTH, CANVAS_HEIGHT] = [29 * DOT + DOT / 2, 280.5];

class Pattern {
  constructor(issymmetric = true) {
    this._issymmetric = issymmetric;
    this._canvas = createCanvas(CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2 - DOT);
    this._ctx = this._canvas.getContext("2d");

    this._ctx.translate(0.5, 0.5);
    this._ctx.translate(DOT / 2 - 0.5, DOT / 2);
    this.drawPart(true);
    if (!issymmetric) {
      this.drawPart(false);
    }
    this.mirrorImage(true, false);
    if (issymmetric) {
      this.mirrorImage(true, true);
    }
  }
  drawGrid(ctx) {
    ctx.lineWidth = GRID_LINE;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    for (let x = 0; x <= CANVAS_WIDTH * 2; x += DOT) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT * 2);
      for (let y = 0; y <= CANVAS_HEIGHT * 2; y += DOT) {
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH * 2, y);
      }
    }
    ctx.stroke();
    ctx.closePath();
  }
  drawStitch(x, y, len) {
    this._ctx.lineWidth = STITCH_LINE;
    this._ctx.moveTo(x * DOT, y * DOT);
    this._ctx.lineTo(x * DOT + len * DOT, y * DOT);
  }
  mirrorImage(horizontal = false, vertical = false) {
    this._ctx.save();
    this._ctx.setTransform(
      horizontal ? -1 : 1,
      0,
      0,
      vertical ? -1 : 1,
      horizontal ? this._canvas.width : 0,
      vertical ? this._canvas.height : 0
    );
    this._ctx.drawImage(this._canvas, 0, 0);
    this._ctx.restore();
  }

  drawPart(isTop) {
    this._ctx.strokeStyle = "rgba(0,0,255,1)";
    this._ctx.beginPath();
    let shift = isTop ? 2 : 4;
    for (let y = isTop ? 13 : 14; isTop ? y >= 1 : y <= 25; isTop ? y-- : y++) {
      let len = 4;
      switch (y) {
        case 1:
        case 25:
          len = 2;
          break;
        case 2:
        case 24:
          len = 6;
          break;
      }
      this.drawStitch((shift += 2), y, len);
      let ln = 2;
      for (let i = shift + 8; i <= 28; i += 2) {
        if (isDraw()) {
          this.drawStitch(i, y, ln);
        }
      }
    }
    this._ctx.stroke();
    this._ctx.closePath();
  }

  draw() {
    let canvas = createCanvas(CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2 - DOT);
    let ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2);
    ctx.save();
    ctx.translate(0.5, 0.5);
    this.drawGrid(ctx);
    ctx.restore();
    ctx.drawImage(this._canvas, 0, 0);
    return canvas.toBuffer();
  }

  //   drawImg() {
  //     let canvas = createCanvas(CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2 - DOT);
  //     let ctx = canvas.getContext("2d");

  //     ctx.fillStyle = "rgba(255,255,255,1)";
  //     ctx.fillRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2);
  //     ctx.save();
  //     ctx.translate(0.5, 0.5);
  //     this.drawGrid(ctx);
  //     ctx.restore();
  //     ctx.drawImage(this._canvas, 0, 0);

  //     const out = fs.createWriteStream(__dirname + "/test.png");
  //     const stream = canvas.createPNGStream();
  //     stream.pipe(out);
  //     out.on("finish", () => console.log("The PNG file was created."));
  //   }
}

// const p = new Pattern(true);
// p.drawImg();

function toAnalitics(user, msg) {
  let message = msg;
  if (user) {
    message += ` from ${user.first_name} ${user.last_name || ""} ${
      user.username || ""
    } ${user.language_code || ""}`;
  }
  axios
    .post("https://chatbase-area120.appspot.com/api/message", {
      api_key: process.env.CHATBASE,
      type: "user",
      platform: "telegram",
      message,
      version: "1.0",
      user_id: user ? user.id : "unkn",
    })
    .catch((error) => {
      console.log(error);
    });
}

function main() {
  const token = process.env["TOKEN"];
  const bot = new TelegramBot(token, { polling: true });
  bot.onText(/\/symmetric/, (msg, match) => {
    const chatId = msg.chat.id;
    const p = new Pattern(true);
    toAnalitics(msg.from, "symmetric");
    bot.sendPhoto(chatId, p.draw());
  });
  bot.onText(/\/asymmetric/, (msg, match) => {
    const chatId = msg.chat.id;
    const p = new Pattern(false);
    toAnalitics(msg.from, "asymmetric");
    bot.sendPhoto(chatId, p.draw());
  });
}

main();
