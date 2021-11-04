const Utils = require('./Utils');

class SmartContract {
  static parseString(data) {
    // ++ temp for only 1 string data
    let seed = data;
    if (seed.indexOf('0x') === 0) {
      seed = seed.substr(2);
    }

    const strPointer = parseInt(seed.slice(0, 64), 16);
    const strBuf = Buffer.from(seed.slice(64), 'hex');
    const strLen = parseInt(strBuf.slice(0, 32).toString('hex'), 16);
    const res = strBuf.slice(32, strLen + 32).toString();
    return res;
  }

  static encodeString(string) {
    if (typeof string !== 'string') throw new Error(`encodeString ${string} must input string`);
    const bufBaseStr = Buffer.from(string);
    const hexLenStr = Utils.toHex(bufBaseStr.length);
    // pad start
    const bufHexLenStr = Buffer.from(Utils.leftPad32(hexLenStr), 'hex');

    // pad end
    const padLen = (32 - (bufBaseStr.length % 32)) % 32;
    const bufPad = Buffer.alloc(padLen);
    const bufStr = Buffer.concat([bufBaseStr, bufPad]);

    const res = Buffer.concat([bufHexLenStr, bufStr]);
    return {
      length: res.length,
      data: res.toString('hex'),
    };
  }
}

module.exports = SmartContract;
