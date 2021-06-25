const {
  getImage,
  getBuffer,
  generatePattern,
  isTrue,
  getStitchCount,
} = require("../utils");

describe("isTrue", () => {
  it("should be false or true", () => {
    for (let index = 0; index < 1000; index++) {
      const res = isTrue();
      expect(typeof res).toBe("boolean");
    }
  });
  it("should be random", () => {
    let arr = [];
    for (let index = 0; index < 100; index++) {
      arr.push(isTrue());
      expect(arr.filter((a) => a).length).toBeLessThan(100);
    }
  });
});

describe("getStitchCount", () => {
  it("should > 1 and <= n", () => {
    for (let index = 1; index < 1000; index++) {
      expect(getStitchCount(index)).toBeGreaterThanOrEqual(1);
      expect(getStitchCount(index)).toBeLessThanOrEqual(index);
    }
  });
  it("should be random", () => {
    let arr = [];
    for (let index = 1; index <= 100; index++) {
      arr.push(getStitchCount(3));
    }
    expect(arr.filter((a) => a === arr[0]).length).toBeLessThan(100);
  });
});

describe("generatePattern", () => {
  it("symmetric should have 9 lines", () => {
    for (let index = 1; index < 1000; index++) {
      const str = generatePattern(true);
      const arr = str.split(/\n/);
      expect(arr.length).toBe(9);
    }
  });
  it("asymmetric should have 17 lines", () => {
    for (let index = 1; index < 1000; index++) {
      const str = generatePattern(false);
      const arr = str.split(/\n/);
      expect(arr.length).toBe(17);
    }
  });
});

describe("getBuffer", () => {
  it("return promise with buffer", async () => {
    let canvas = {
      toBuffer(callback) {
        callback(null, "ok");
      },
    };
    expect(await getBuffer(canvas)).toBe("ok");
  });
});
