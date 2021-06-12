const http = require("http");

module.exports = class Web {
  constructor(port, router) {
    this._server = http.createServer((req, res) => {}).listen(8000);
  }
  async close() {
    await new Promise((_, rej) =>
      this._server.close((err) => {
        if (err) {
          rej(err);
        }
      })
    );
  }
};
