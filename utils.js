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

module.exports = {
  getBuffer,
  isTrue,
};
