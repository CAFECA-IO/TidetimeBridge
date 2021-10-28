const Utils = require('./Utils');

const CONTRACT_CODE = {
  burnToken: '8523c3ca',
  getToken: 'f732df6d',
  mintToken: '6adc8e99',
};

class TokenManagerDataBuilder {
  /**
   *
   * @param {Object} param
   * @param {string} param.tokenAddress
   * @param {string} param.amount
   * @param {string} param.userAddress
   * @param {string} param.txHash
   * @returns
   */
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
      this.logger.error('encodeBurnToken error', param);
      throw new Error('encodeBurnToken invalid input');
    }

    const normalizeTokenAddr = Utils.leftPad32(Utils.toHex(tokenAddress));
    const normalizeAmount = Utils.leftPad32(Utils.decToHex(amount, { prefix: false }));
    const normalizeUserAddress = Utils.leftPad32(Utils.toHex(userAddress));
    const normalizeTxHash = Utils.leftPad32(Utils.toHex(txHash));

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

    const normalizeChainId = Utils.rightPad32(chainId.replace('0x', '')); // because byte4 is pad right
    let normalizeAddr;
    if (Utils.isBTCLike(chainId)) {
      // ++ todo add btc address decode
    }
    if (Utils.isETHLike(chainId)) {
      normalizeAddr = Utils.leftPad32(Utils.toHex(fromContractAddress));
    }

    let res = '0x';
    res += CONTRACT_CODE.getToken;
    res += normalizeChainId;
    res += normalizeAddr;

    return res;
  }

  /**
   *
   * @param {Object} param
   * @param {string} param.name
   * @param {string} param.symbol
   * @param {number} param.decimals
   * @param {string} param.chainId
   * @param {string} param.fromContractAddress
   * @param {string} param.userAddress
   * @param {string} param.amount
   * @param {string} param.txHash,
   * @returns
   */
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
    const encodeSymbol = this.encodeString(this.renameSymbol(symbol));

    const normalizeChainId = Utils.rightPad32(chainId.replace('0x', '')); // because byte4 is pad right
    let normalizeFromAddr;
    if (Utils.isBTCLike(chainId)) {
      // ++ todo add btc address decode
    }
    if (Utils.isETHLike(chainId)) {
      normalizeFromAddr = Utils.leftPad32(Utils.toHex(fromContractAddress));
    }

    const normalizeUserAddress = Utils.leftPad32(Utils.toHex(userAddress));
    const normalizeAmount = Utils.leftPad32(Utils.decToHex(amount, { prefix: false }));
    const normalizeTxHash = Utils.leftPad32(Utils.toHex(txHash));

    let res = '0x';
    const encodeStrArr = [];
    res += CONTRACT_CODE.mintToken;

    // name
    res += Utils.leftPad32(Utils.toHex(strLocation));
    encodeStrArr.push(encodeName.data);
    strLocation += encodeName.length;

    // symbol
    res += Utils.leftPad32(Utils.toHex(strLocation));
    encodeStrArr.push(encodeSymbol.data);
    strLocation += encodeSymbol.length;

    // decimals
    res += Utils.leftPad32(Utils.toHex(decimals));

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
    const bufHexLenStr = Buffer.from(Utils.leftPad32(hexLenStr), 'hex');

    // pad end
    const encodeStr = bufBaseStr.toString('hex');
    const bufStr = Buffer.from(Utils.rightPad32(encodeStr), 'hex');

    const res = Buffer.concat([bufHexLenStr, bufStr]);
    return {
      length: res.length,
      data: res.toString('hex'),
    };
  }

  static renameSymbol(symbol) {
    let value = symbol;
    if (!symbol.startsWith('tt', 0)) {
      value = `tt${symbol}`;
    }
    return value;
  }
}
module.exports = TokenManagerDataBuilder;
