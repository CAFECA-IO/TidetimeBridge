const dvalue = require('dvalue');
const Utils = require('./Utils');
const SupportChain = require('./SupportChain');

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
        const chainId = data.result.replace('0x', '').slice(0, 8); // byte4
        return chainId;
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

  async getTargetTxResult(txid) {
    if (Utils.isETHLike(this._baseChain.blockchainId)) {
      return this._getEthReceipt(txid);
    }
    if (Utils.isBTCLike(this._baseChain.blockchainId)) {
      return this._getBtcTxResult(txid);
    }

    throw new Error('not support block chain');
  }

  async _getEthReceipt(txid) {
    console.log('_getEthReceipt', txid);
    const type = 'getReceipt';
    const options = dvalue.clone(this._baseChain);
    options.data = this.cmd({ type, txid });
    const checkId = options.data.id;
    const data = await Utils.ETHRPC(options);
    if (data instanceof Object) {
      if (data.id !== checkId) {
        throw new Error('_getEthReceipt fail: checkId not the same');
      }
      if (data.result || data.result === null) {
        return data.result;
      }
    }
    console.log(JSON.stringify(data));
    throw new Error('_getEthReceipt fail:', data);
  }

  async _getBtcTxResult(txid) {
    const type = 'getBtcTx';
    const options = dvalue.clone(this._baseChain);
    options.data = this.cmd({ type, txid });
    const checkId = options.data.id;
    const data = await Utils.BTCRPC(options);
    if (data instanceof Object) {
      if (data.id !== checkId) {
        throw new Error('_getBtcTxResult fail: checkId not the same');
      }
      if (data.result) {
        return data.result;
      }
    }
    console.log(JSON.stringify(data));
    throw new Error('_getBtcTxResult fail:', data);
  }

  async getTx(txid) {
    if (Utils.isETHLike(this._baseChain.blockchainId)) {
      return this._getEthTx(txid);
    }
    if (Utils.isBTCLike(this._baseChain.blockchainId)) {
      return this._getBtcTxResult(txid);
    }

    throw new Error('not support block chain');
  }

  async _getEthTx(txid) {
    console.log('_getEthTx', txid);
    const type = 'getEthTx';
    const options = dvalue.clone(this._baseChain);
    options.data = this.cmd({ type });
    const checkId = options.data.id;
    const data = await Utils.ETHRPC(options);
    if (data instanceof Object) {
      if (data.id !== checkId) {
        throw new Error('_getEthTx fail: checkId not the same');
      }
      if (data.result || data.result === null) {
        return data.result;
      }
    }
    console.log(JSON.stringify(data));
    throw new Error('_getEthTx fail:', data);
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
      case 'getBtcTx':
        result = {
          jsonrpc: '1.0',
          id: dvalue.randomID(),
          method: 'getrawtransaction',
          params: [
            txid,
            true,
          ],
        };
        break;
      case 'getEthTx':
        result = {
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [
            txid,
            false,
          ],
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
