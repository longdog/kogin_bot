const http = require("http");
const path = require("path");
const fs = require("fs");

const serveFile = (name) => {
  const filePath = path.join("static", name);
  return fs.createReadStream(filePath);
};

module.exports = class Web {
  constructor(port, router) {
    this._server = http
      .createServer((req, res) => {
        const { url } = req;
        if (/^\/asymmetric/.test(url)) {
          const p = router["asymmetric"]().canvas;
          res.writeHead(200, { "Content-Type": "image/png" });
          p.createPNGStream().pipe(res);
        } else if (/^\/symmetric/.test(url)) {
          const p = router["symmetric"]().canvas;
          res.writeHead(200, { "Content-Type": "image/png" });
          p.createPNGStream().pipe(res);
        } else {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          serveFile("index.html").pipe(res);
        }
      })
      .listen(port);
    console.log("Start web service");
  }
  get server() {
    return this._server;
  }
  async close() {
    await new Promise((res, rej) =>
      this._server.close((err) => {
        console.log("Close web service");
        if (err) {
          rej(err);
        } else {
          res();
        }
      })
    );
  }
};
