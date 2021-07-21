const Channel = require("../Channel");
const { router, Bot } = require("./mocks");

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
  beforeEach(async () => {
    b = new Bot();
    t = new Channel(b, "test", router, 100);
    t.start();
  });
  afterEach(async () => {
    return await t.close();
  });
  it("should return next photo on sendPhoto", async () => {
    await t.sendPhoto();
    expect(b.photo.b).toBe("next");
  });
  it("should init timer on start", async () => {
    expect(t._timer).toBeDefined();
  });
});
