const { router, Bot } = require("./mocks");
const Telegram = require("../Telegram");

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
