const Utils = require('./Utils');

const CONTRACT_CODE = {
  setDepositAddress: '78c247a3',
  setWithdrawAddress: '6111e7f8',
  getAddress: '7ac672b4',
};

class AddressMappingDataBuilder {
  /**
   *
   * @param {Object} param
   * @param {string} param.chainId
   * @param {string} param.fromAddress
   * @param {string} param.toAddress
   * @returns
   */
  static encodeSetDepositAddress(param) {
    // 0x78c247a3
    // 8000000000000000000000000000000000000000000000000000000000000000
    // 0000000000000000000000000000000000000000000000000000000000000060
    // 00000000000000000000000000000000000000000000000000000000000000c0
    // 000000000000000000000000000000000000000000000000000000000000002a
    // 7462317171736a38656e776d68727a7a3976777833346668766d346e6e68656c
    // 6835367161667033386b00000000000000000000000000000000000000000000
    // 000000000000000000000000000000000000000000000000000000000000002a
    // 3078323533633765353363373735633736636237343363336232333537396638
    // 3430323830303835653600000000000000000000000000000000000000000000

    const {
      chainId, fromAddress, toAddress,
    } = param;

    if (!chainId || !fromAddress || !toAddress) {
      this.logger.error('encodeSetDepositAddress error', param);
      throw new Error('encodeSetDepositAddress invalid input');
    }

    const normalizeChainId = Utils.rightPad32(chainId.replace('0x', '')); // because byte4 is pad right

    let strLocation = 3 * 32; // 3 param * 32 byte
    const encodeFromAddress = Utils.encodeString(fromAddress);
    const encodeToAddress = Utils.encodeString(toAddress);

    let res = '0x';
    const encodeStrArr = [];

    res += CONTRACT_CODE.setDepositAddress;
    res += normalizeChainId;

    // fromAddress
    res += Utils.leftPad32(Utils.toHex(strLocation));
    encodeStrArr.push(encodeFromAddress.data);
    strLocation += encodeFromAddress.length;

    // toAddress
    res += Utils.leftPad32(Utils.toHex(strLocation));
    encodeStrArr.push(encodeToAddress.data);
    strLocation += encodeToAddress.length;

    // add string data
    res += encodeStrArr.join('');

    return res;
  }

  /**
   *
   * @param {Object} param
   * @param {string} param.chainId
   * @param {string} param.fromAddress
   * @param {string} param.toAddress
   * @returns
   */
  static encodeSetWithdrawAddress(param) {
    // 0x6111e7f8
    // 8000000000000000000000000000000000000000000000000000000000000000
    // 0000000000000000000000000000000000000000000000000000000000000060
    // 00000000000000000000000000000000000000000000000000000000000000c0
    // 000000000000000000000000000000000000000000000000000000000000002a
    // 3078323533633765353363373735633736636237343363336232333537396638
    // 3430323830303835653600000000000000000000000000000000000000000000
    // 000000000000000000000000000000000000000000000000000000000000002a
    // 7462317171736a38656e776d68727a7a3976777833346668766d346e6e68656c
    // 6835367161667033386b00000000000000000000000000000000000000000000

    const {
      chainId, fromAddress, toAddress,
    } = param;

    if (!chainId || !fromAddress || !toAddress) {
      this.logger.error('encodeSetWithdrawAddress error', param);
      throw new Error('encodeSetWithdrawAddress invalid input');
    }

    const normalizeChainId = Utils.rightPad32(chainId.replace('0x', '')); // because byte4 is pad right

    let strLocation = 3 * 32; // 3 param * 32 byte
    const encodeFromAddress = Utils.encodeString(fromAddress);
    const encodeToAddress = Utils.encodeString(toAddress);

    let res = '0x';
    const encodeStrArr = [];

    res += CONTRACT_CODE.setWithdrawAddress;
    res += normalizeChainId;

    // fromAddress
    res += Utils.leftPad32(Utils.toHex(strLocation));
    encodeStrArr.push(encodeFromAddress.data);
    strLocation += encodeFromAddress.length;

    // toAddress
    res += Utils.leftPad32(Utils.toHex(strLocation));
    encodeStrArr.push(encodeToAddress.data);
    strLocation += encodeToAddress.length;

    // add string data
    res += encodeStrArr.join('');

    return res;
  }

  /**
   *
   * @param {Object} param
   * @param {string} param.chainId
   * @param {string} param.fromAddress
   */
  static encodeGetAddress(param) {
    // 0x7ac672b4
    // 8000000000000000000000000000000000000000000000000000000000000000
    // 0000000000000000000000000000000000000000000000000000000000000040
    // 000000000000000000000000000000000000000000000000000000000000002a
    // 3078323533633765353363373735633736636237343363336232333537396638
    // 3430323830303835653600000000000000000000000000000000000000000000

    const {
      chainId, fromAddress,
    } = param;

    if (!chainId || !fromAddress) {
      throw new Error('encodeGetAddress invalid input');
    }

    let strLocation = 2 * 32; // 2 param * 32 byte
    const normalizeChainId = Utils.rightPad32(chainId.replace('0x', '')); // because byte4 is pad right
    const encodeFromAddress = Utils.encodeString(fromAddress);

    let res = '0x';
    const encodeStrArr = [];

    res += CONTRACT_CODE.getAddress;
    res += normalizeChainId;

    // fromAddress
    res += Utils.leftPad32(Utils.toHex(strLocation));
    encodeStrArr.push(encodeFromAddress.data);
    strLocation += encodeFromAddress.length;

    // add string data
    res += encodeStrArr.join('');

    return res;
  }
}
module.exports = AddressMappingDataBuilder;
