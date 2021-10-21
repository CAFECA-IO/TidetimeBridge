const Utils = require('./Utils');

const CONTRACT_CODE = {
  burnToken: '8523c3ca',
  getToken: 'f732df6d',
  mintToken: '6adc8e99',
};

class TokenManagerTransaction {
  constructor(param) {
    this._to = param.to ? param.to : '';
    this._amount = param.amount ? param.amount : '';
    this._feePerUnit = param.feePerUnit ? param.feePerUnit : '';
    this._fee = param.fee ? param.fee : '';
    this._gasUsed = param.gasUsed ? param.gasUsed : 0;
    this._message = param.message ? param.message : '';
    this._chainId = param.chainId ? param.chainId : 8017;
    this._nonce = param.nonce ? param.nonce : 0;
    return this;
  }

  // setter
  set to(to) { this._to = to; }

  set amount(amount) { this._amount = amount; }

  set feePerUnit(feePerUnit) { this._feePerUnit = feePerUnit; }

  set fee(fee) { this._fee = fee; }

  set gasUsed(gasUsed) { this._gasUsed = gasUsed; }

  set message(message) { this._message = message; }

  set chainId(chainId) { this._chainId = chainId; }

  set nonce(nonce) { this._nonce = nonce; }

  // getter
  get to() { return this._to; }

  get amount() { return this._amount; }

  get feePerUnit() { return this._feePerUnit; }

  get fee() { return this._fee; }

  get gasUsed() { return this._gasUsed; }

  get message() { return this._message; }

  get chainId() { return this._chainId; }

  get nonce() { return this._nonce; }

  static encodeBurnToken(param) {
    // 0x8523c3ca
    // 00000000000000000000000080922db6752ece1c2defa54beb8fb984e649308b
    // 0000000000000000000000000000000000000000000000000000000000000141
    // 0000000000000000000000005b38da6a701c568545dcfcb03fcb875f56beddc4
    // 16ba1702e725deb82db1215911be30ede0699b439a33660f68238e5f15a854bb

    const {
      tokenAddress, amount, userAddress, txHash,
    } = param;

    if (!tokenAddress || !amount || !userAddress || !txHash) {
      throw new Error('encodeBurnToken invalid input');
    }

    const normalizeTokenAddr = this.leftPad32(Utils.toHex(tokenAddress));
    const normalizeAmount = this.leftPad32(Utils.decToHex(amount, { prefix: false }));
    const normalizeUserAddress = this.leftPad32(Utils.toHex(userAddress));
    const normalizeTxHash = this.leftPad32(Utils.toHex(txHash));

    let res = '0x';
    res += CONTRACT_CODE.burnToken;
    res += normalizeTokenAddr;
    res += normalizeAmount;
    res += normalizeUserAddress;
    res += normalizeTxHash;

    return res;
  }

  /**
   *
   * @param {Object} param
   * @param {string} param.chainId
   * @param {string} param.fromContractAddress
   */
  static encodeGetToken(param) {
    // 0xf732df6d
    // 8000003c00000000000000000000000000000000000000000000000000000000
    // 0000000000000000000000003841c791e5d10595b665f9b118877e28d1327ee8
    const {
      chainId, fromContractAddress,
    } = param;

    if (!chainId || !fromContractAddress) {
      throw new Error('encodeGetToken invalid input');
    }

    const normalizeChainId = this.rightPad32(chainId.replace('0x', '')); // because byte4 is pad right
    let normalizeAddr;
    if (Utils.isBTCLike(chainId)) {
      // ++ todo add btc address decode
    }
    if (Utils.isETHLike(chainId)) {
      normalizeAddr = this.leftPad32(Utils.toHex(fromContractAddress));
    }

    let res = '0x';
    res += CONTRACT_CODE.getToken;
    res += normalizeChainId;
    res += normalizeAddr;

    return res;
  }

  static encodeMintToken(param) {
    // 0x6adc8e99
    // 0000000000000000000000000000000000000000000000000000000000000100
    // 0000000000000000000000000000000000000000000000000000000000000140
    // 000000000000000000000000000000000000000000000000000000000000000c
    // 8000003c00000000000000000000000000000000000000000000000000000000
    // 0000000000000000000000003841c791e5d10595b665f9b118877e28d1327ee8
    // 0000000000000000000000005b38da6a701c568545dcfcb03fcb875f56beddc4
    // 000000000000000000000000000000000000000000000000000000000001e1b9
    // af8fb3b6f9cd8add0a3f7eeeba51cede498662638dd2bf7a4beab0e062a856a6
    // 0000000000000000000000000000000000000000000000000000000000000003
    // 5454310000000000000000000000000000000000000000000000000000000000
    // 0000000000000000000000000000000000000000000000000000000000000002
    // 5454000000000000000000000000000000000000000000000000000000000000

    const {
      name, symbol, decimals, chainId, fromContractAddress, userAddress, amount, txHash,
    } = param;

    if (!name || !symbol || !decimals || !chainId || !fromContractAddress || !userAddress || !amount || !txHash) {
      throw new Error('encodeMintToken invalid input');
    }

    let strLocation = 8 * 32; // 8 param * 32 byte
    const encodeName = this.encodeString(name);
    const encodeSymbol = this.encodeString(symbol);

    const normalizeChainId = this.rightPad32(chainId.replace('0x', '')); // because byte4 is pad right
    let normalizeFromAddr;
    if (Utils.isBTCLike(chainId)) {
      // ++ todo add btc address decode
    }
    if (Utils.isETHLike(chainId)) {
      normalizeFromAddr = this.leftPad32(Utils.toHex(fromContractAddress));
    }

    const normalizeUserAddress = this.leftPad32(Utils.toHex(userAddress));
    const normalizeAmount = this.leftPad32(Utils.decToHex(amount, { prefix: false }));
    const normalizeTxHash = this.leftPad32(Utils.toHex(txHash));

    let res = '0x';
    const encodeStrArr = [];
    res += CONTRACT_CODE.mintToken;

    // name
    res += this.leftPad32(Utils.toHex(strLocation));
    encodeStrArr.push(encodeName.data);
    strLocation += encodeName.length;

    // symbol
    res += this.leftPad32(Utils.toHex(strLocation));
    encodeStrArr.push(encodeSymbol.data);
    strLocation += encodeSymbol.length;

    // decimals
    res += this.leftPad32(Utils.toHex(decimals));

    // chainId
    res += normalizeChainId;

    // fromContractAddr
    res += normalizeFromAddr;

    // userAddr
    res += normalizeUserAddress;

    // amount
    res += normalizeAmount;

    // tx hash
    res += normalizeTxHash;

    // add string data
    res += encodeStrArr.join('');

    return res;
  }

  static encodeString(string) {
    const bufBaseStr = Buffer.from(string);
    const hexLenStr = Utils.toHex(bufBaseStr.length);
    // pad start
    const bufHexLenStr = Buffer.from(this.leftPad32(hexLenStr), 'hex');

    // pad end
    const encodeStr = bufBaseStr.toString('hex');
    const bufStr = Buffer.from(this.rightPad32(encodeStr), 'hex');

    const res = Buffer.concat([bufHexLenStr, bufStr]);
    return {
      length: res.length,
      data: res.toString('hex'),
    };
  }

  static leftPad32(str) {
    let result = '';
    let length = 32 * 2;
    let arr;
    if (typeof str === 'string') {
      length -= (str.length % length) ? (str.length % length) : length;
      arr = new Array(length).fill(0);
      arr.push(str);
    } else {
      arr = new Array(length).fill(0);
    }
    result = arr.join('');
    return result;
  }

  static rightPad32(str) {
    let result = '';
    let length = 32 * 2;
    let arr = [];
    if (typeof str === 'string') {
      length -= (str.length % length) ? (str.length % length) : length;
      arr.push(str);
      arr = arr.concat(new Array(length).fill(0));
    } else {
      arr = new Array(length).fill(0);
    }
    result = arr.join('');
    return result;
  }
}
module.exports = TokenManagerTransaction;
