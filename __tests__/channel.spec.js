const { Readable } = require("stream");
const Channel = require("../Channel");

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
  next: () => pattern("next"),
  generate: (str) => pattern(str),
};

function Bot() {
  this.routes = new Map();
  this.dispatch = async (s, msg) => {
    for (const r of this.routes) {
      if (r[0].test(s)) {
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

describe("Channel", () => {
  it("should be init and has _bot, __chanId, _period and _router fields", () => {
    const b = new Bot();
    const c = new Channel(b, "test", router, 100);
    expect(c).toMatchObject({ _bot: b });
    expect(c).toMatchObject({ _router: router });
    expect(c).toMatchObject({ _chanId: "test" });
    expect(c).toMatchObject({ _period: 100 });
  });
});

describe("Channel work", () => {
  let t = undefined;
  let b = undefined;
  beforeEach(() => {
    b = new Bot();
    t = new Channel(b, "test", router, 100);
    t.start();
  });
  afterEach(async () => await t.close());
  it("should return next photo on sendPhoto", async () => {
    await t.sendPhoto();
    expect(b.photo.b).toBe("next");
  });
  it("should init timer on start", () => {
    const b = new Bot();
    const t = new Channel(b, "test", router, 100);
    t.start();
    expect(t._timer).toBeDefined();
  });
});
