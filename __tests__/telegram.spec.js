const { Readable } = require("stream");
const Telegram = require("../Telegram");

const pattern = (type) => ({
  canvas: {
    createPNGStream() {
      return Readable.from(["ok"]);
    },
    toBuffer(callback) {
      callback(null, type);
    },
  },
});
const router = {
  asymmetric: () => pattern("asymmetric"),
  symmetric: () => pattern("symmetric"),
  generate: (str) => pattern(str),
};

function Bot() {
  this.routes = new Map();
  this.dispatch = async (s, msg) => {
    for (const r of this.routes) {
      if (r[0].test(s)) {
        console.log(msg);
        await r[1](msg, { input: s });
        return;
      }
    }
  };
  this.onText = (route, callback) => {
    this.routes.set(route, callback);
  };
  this.sendPhoto = (chatId, b) => {
    this.photo = { chatId, b };
  };
  this.sendMessage = (chatId, err) => {
    this.photo = { chatId, err };
  };
}

describe("Telegram", () => {
  it("should be init and has _bot and _router fields", () => {
    const b = new Bot();
    const t = new Telegram(b, router);
    expect(t).toMatchObject({ _bot: b });
    expect(t).toMatchObject({ _router: router });
  });
  it("should return symmetric on symmetric route", async () => {
    const b = new Bot();
    const t = new Telegram(b, router);
    t.start();
    await b.dispatch("/symmetric/", { chat: { id: 1 } });
    expect(b.photo.chatId).toBe(1);
    expect(b.photo.b).toBe("symmetric");
  });
  it("should return asymmetric on asymmetric route", async () => {
    const b = new Bot();
    const t = new Telegram(b, router);
    t.start();
    await b.dispatch("/asymmetric/", { chat: { id: 1 } });
    expect(b.photo.chatId).toBe(1);
    expect(b.photo.b).toBe("asymmetric");
  });
  it("should return ok on pattern route", async () => {
    const b = new Bot();
    const t = new Telegram(b, router);
    t.start();
    const pat = `01\n`.repeat(8);
    await b.dispatch(pat, { chat: { id: 1 } });
    expect(b.photo.chatId).toBe(1);
    expect(b.photo.b).toBe(pat);
  });
});
