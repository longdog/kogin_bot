const { createCanvas } = require("canvas");

class Pattern {
  /**
   * Kogin pattern class
   * @param {number} width canvas width
   * @param {number} height canvas height
   * @param {number} stitchStep one stitch length
   * @param {number} stitchWeight stitch weight
   */
  constructor(width, height, stitchStep, stitchWeight) {
    this.width = width;
    this.height = height;
    this._stitch = { stitchStep, stitchWeight };
    this.canvas = createCanvas(width, height);
    this._ctx = this.canvas.getContext("2d");
    this._ctx.translate(0.5, 0.5);
    this._ctx.translate(stitchStep / 2 - 0.5, stitchStep / 2);
  }

  _drawStitch(x, y, len) {
    this._ctx.lineWidth = this._stitch.stitchWeight;
    this._ctx.moveTo(x * this._stitch.stitchStep, y * this._stitch.stitchStep);
    this._ctx.lineTo(
      x * this._stitch.stitchStep + len * this._stitch.stitchStep,
      y * this._stitch.stitchStep
    );
  }

  _mirror(horizontal = false, vertical = false) {
    this._ctx.save();
    this._ctx.setTransform(
      horizontal ? -1 : 1,
      0,
      0,
      vertical ? -1 : 1,
      horizontal ? this.width : 0,
      vertical ? this.height : 0
    );
    this._ctx.drawImage(this.canvas, 0, 0);
    this._ctx.restore();
  }

  draw(str, isSymmetric = true) {
    let patternArr = str.split(/\n/);
    if (patternArr.length !== 9) {
      throw new Error("wrong format");
    }
    this._drawTopStr(patternArr);
    this._mirror(true, false);
    this._mirror(true, true);
  }

  _drawTopStr(patternArr) {
    this._ctx.strokeStyle = "rgba(0,0,255,1)";
    this._ctx.beginPath();
    let shift = 2;
    for (let y = 13; y >= 1; y--) {
      let len = 4;
      switch (y) {
        case 1:
          len = 2;
          break;
        case 2:
          len = 6;
          break;
      }
      this._drawStitch((shift += 2), y, len);
      if (patternArr.length) {
        let pat = patternArr.pop();
        let i = shift + 5;
        let hasPrev = false;
        for (const p of pat) {
          if (p === "0") {
            i++;
          } else {
            const n = parseInt(p) + 1;
            this._drawStitch(hasPrev ? ++i : i, y, n);
            i += n;
            hasPrev = true;
          }
        }
      }
    }
    this._ctx.stroke();
    this._ctx.closePath();
  }
}
/**
 * Kogin pattern factory
 * @param {number} width canvas width
 * @param {number} height canvas height
 * @param {number} stitchStep one stitch length
 * @param {number} stitchWeight stitch weight
 * @return {function} New pattern factory method
 */
module.exports = function patternFactory(
  width,
  height,
  stitchStep,
  stitchWeight
) {
  /**
   * New pattern factory method
   * @param {string} pattern in string format
   * @return {Pattern} pattern object
   */
  return (patternStr) => {
    const p = new Pattern(width, height, stitchStep, stitchWeight);
    p.draw(patternStr);
    return p;
  };
};
