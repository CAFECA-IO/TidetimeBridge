const dvalue = require('dvalue');
const Utils = require('./Utils');

class JsonRpc {
  constructor(blockChainConfig) {
    this._baseChain = blockChainConfig;
  }

  async getShadowTokenChainId(address) {
    const type = 'callContract';
    const options = dvalue.clone(this._baseChain);
    const command = '0xadc879e9'; // shadow token get ChainId()
    options.data = this.cmd({ type, address, command });
    const checkId = options.data.id;
    const data = await Utils.ETHRPC(options);
    if (data instanceof Object) {
      if (data.id !== checkId) {
        throw new Error('getShadowTokenChainId fail: checkId not the same');
      }
      if (data.result) {
        return data.result;
      }
    }

    throw new Error('getShadowTokenChainId fail:', data);
  }

  async getShadowTokenFromContractAddress(address) {
    const type = 'callContract';
    const options = dvalue.clone(this._baseChain);
    const command = '0x2f3025c1'; // shadow token get fromContractAddress()
    options.data = this.cmd({ type, address, command });
    const checkId = options.data.id;
    const data = await Utils.ETHRPC(options);
    if (data instanceof Object) {
      if (data.id !== checkId) {
        throw new Error('getShadowTokenFromContractAddress fail: checkId not the same');
      }
      if (data.result) {
        return data.result;
      }
    }

    throw new Error('getShadowTokenFromContractAddress fail:', data);
  }

  cmd({
    type, address, command, txid,
  }) {
    let result;
    switch (type) {
      case 'callContract':
        result = {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: address,
            data: command,
          }, 'latest'],
          id: dvalue.randomID(),
        };
        break;
      case 'getReceipt':
        result = {
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [txid],
          id: dvalue.randomID(),
        };
        break;
      default:
        result = {};
    }
    return result;
  }
}

module.exports = JsonRpc;
