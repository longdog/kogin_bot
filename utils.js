const fs = require("fs");

// const str = `0001
// 0005
// 0009
// 000009
// 00000009
// 0001000005
// 0005000001
// 0009
// 000009`;

// const str2 = `0001
// 0005
// 0009
// 000009
// 00000009
// 0001000005
// 0003010001
// 000503
// 00050005`;

function getImage(canvas, filepath) {
  const out = fs.createWriteStream(filepath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("The PNG file was created."));
}

function getBuffer(canvas) {
  return new Promise((res, rej) =>
    canvas.toBuffer((err, buff) => {
      if (err) {
        rej(err);
      } else {
        res(buff);
      }
    })
  );
}

function isTrue() {
  return Math.random() >= 0.5;
}

/**
 * get random stitch count 1-max
 * @param {number} max max stitch count
 */
function getStitchCount(max) {
  return Math.floor(Math.random() * max) + 1;
}

function getLine(len) {
  const genLine = (curLen, prevSpace) => {
    if (len - curLen === 1 && prevSpace) {
      return "1";
    }
    if (len - curLen <= 1) return "";
    if (isTrue() && prevSpace) {
      const sc = getStitchCount(len - curLen);
      return sc.toString(20) + genLine(curLen + sc + 1, false);
    } else {
      return "0" + genLine(curLen + (prevSpace ? 1 : 2), true);
    }
  };
  let ln = genLine(0, true);
  return "0".repeat(3) + ln;
}

function generatePattern(isSymmetric = true) {
  let str = "";
  let len = 1;

  const maxLineNum = isSymmetric ? 9 : 17;
  for (let i = 0; i < maxLineNum; i++) {
    const strLine = getLine(len);
    len = i < 8 ? len + 2 : len - 2;
    str += strLine + "\n";
  }
  str = str.slice(0, -1);
  return str;
}

module.exports = {
  getImage,
  getBuffer,
  generatePattern,
  isTrue,
  getStitchCount,
};
