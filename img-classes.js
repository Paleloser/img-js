const assert = require('assert');

const headers = {
  GIF87a: '47 49 46 38 37 61',
  GIF89a: '47 49 46 38 39 61',
  tif: '49 49 2A 0',
  tiff: '4D 4D 0 2A',
  bpg: '42 50 47 FB',
  jpg_JFIF: 'FF D8 FF E0 0 10 4A 46 49 46 0 1',
  jpg_Exif: 'FF D8 FF E1',
  png: '89 50 4E 47 D A 1A A'
};
class Image {
  constructor (imgType, body) {
    this.type = imgType;
    this.header = headers[imgType];
    this.body = new Buffer.alloc(body.length, body, body.encoding);
  }
}

class Png extends Image {

  constructor(imgType, body) {
    super(imgType, body);
  }

  parse() {
    return {
      ihdr: this.parseIHDR(this.body),
      plte: this.parsePLTE(this.body, this.ihdr.length)
    }
  }

  /**
   * @param body {Buffer}
   * @returns {{
   *  length: Number,
   *  type: string,
   *  data: { width: {toString: (function(): string), value: Number},
   *          height: {toString: (function(): string), value: Number},
   *          bitDepth: {toString: (function(): string), value: Number},
   *          colorType: {toString: (function(): string), value: Number},
   *          compressionMethod: {toString: (function(): string), value: Number},
   *          filterMethod: {toString: (function(): string), value: Number},
   *          interlaceMethod: {toString: (function(): string), value: Number}},
   *  crc: Number}}
   */
  parseIHDR(body) {
    const ihdr = {
      length: body.readUInt32BE(0),
      type: body.toString('utf8', 4, 8),
      data: {
        width: { toString: () => { return 'Width'},
          value: body.readInt32BE(8)
        },
        height: { toString: () => { return 'Height'},
          value: body.readInt32BE(12)
        },
        bitDepth: { toString: () => { return 'Bit Depth'},
          value: body.readInt8(16)
        },
        colorType: { toString: () => { return 'Color Type'},
          value: body.readInt8(17)
        },
        compressionMethod: { toString: () => { return 'Compression Method'},
          value: body.readInt8(18)
        },
        filterMethod: { toString: () => { return 'Filter Method'},
          value: body.readInt8(19)
        },
        interlaceMethod: { toString: () => { return 'Compression Method'},
          value: body.readInt8(20)
        }
      },
      crc: body.readUInt32BE(21)
    };
    assert.equal(ihdr.type, 'IHDR', 'Something went wrong, IHDR not found!');
    return this.ihdr = ihdr;
  }

  /**
   * @param body {Buffer}
   * @param start {Number}
   * @returns {{length: Number, type: string, data: {r: Number, g: Number, b: Number}, crc: Number}}
   */
  parsePLTE(body, start) {
    const startIndex = start * 2 - 1;
    const plte = {
      length: body.readUInt32BE(startIndex),
      type: body.toString('ascii', startIndex + 4, startIndex + 8),
      data: {
        r: body.readUInt8(startIndex + 8),
        g: body.readUInt8(startIndex + 9),
        b: body.readUInt8(startIndex + 10)
      },
      crc: body.readUInt32BE(startIndex + 15)
    };

    if (plte.type === 'PLTE') return this.plte = plte;
    console.log(`PLTE chunk not found, instead: ${plte.type}`);
  }
}

module.exports = {
  Image,
  Png
};