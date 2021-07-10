const { Readable } = require("stream");

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

module.exports = {
  pattern,
  router,
  Bot,
};
