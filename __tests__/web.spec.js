const request = require("supertest");
const { router } = require("./mocks");
const Web = require("../Web");

const retTest = (server, done) => (err, res) => {
  server.close();
  if (err) return done(err);
  if (!(res.body instanceof Buffer))
    return done(new Error("wrong response type"));
  const buf = Buffer.from(res.body, "utf8");
  if (buf.toString() !== "ok") return done(new Error("wrong response"));
  return done();
};

describe("Web requests", () => {
  it("/symmetric", (done) => {
    const w = new Web(null, router);
    request(w.server).get("/symmetric").expect(200).end(retTest(w, done));
  });
  it("/asymmetric", (done) => {
    const w = new Web(null, router);
    request(w.server).get("/asymmetric").expect(200).end(retTest(w, done));
  });
});

describe("Web close", () => {
  it("should return promise", async () => {
    const w = new Web(null, router);
    expect(await w.close()).toBeUndefined();
  });
});
