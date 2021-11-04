const TideWallet = require('@cafeca/tidewalletjs/src/index');
const BigNumber = require('bignumber.js');

const Bot = require('./Bot');
const ModelFactory = require('./ModelFactory');
const ResponseFormat = require('./ResponseFormat');
const Transaction = require('../structs/Transaction');
const AddressMappingDataBuilder = require('./AddressMappingDataBuilder');
const Utils = require('./Utils');

class Bridge extends Bot {
  constructor() {
    super();
    this.name = 'Bridge';
  }

  init({
    config, database, logger, i18n,
  }) {
    return super.init({
      config, database, logger, i18n,
    })
      .then(() => {
        this._baseChain = this.config.blockchain.base;
        this.tw = new TideWallet();
        // this.tw.on('ready', () => { this.logger.debug('TideWallet is Ready'); });
        this.tw.on('notice', (data) => {
          this.logger.debug('TideWallet get Notice');
          this.logger.debug(data);
          if (data.value.tx.direction === 'receive') { this.createJob(data); }
        });
        // this.tw.on('update', () => { this.logger.debug('TideWallet Data Updated'); });

        const api = {
          apiURL: this.config.tidewalletjs.apiURL,
          apiKey: this.config.tidewalletjs.apiKey,
          apiSecret: this.config.tidewalletjs.apiSecret,
        };
        const user = {
          thirdPartyId: this.config.tidewalletjs.thirdPartyId,
          installId: this.config.tidewalletjs.installId,
        };
        const { debugMode, networkPublish } = this.config.tidewalletjs;

        return this.tw.init({
          user, api, debugMode, networkPublish,
        });
      })
      .then(() => this);
  }

  start() {
    return super.start()
      .then(async () => {
        const overview = await this.tw.overview();
        this._accountInfo = overview.currencies.find((info) => (info.blockchainId === this._baseChain.blockchainId
            && info.type === 'currency'));
      })
      .then(() => this);
  }

  ready() {
    return super.ready()
      .then(() => this);
  }

  async createJob(data) {
    try {
      const { account, tx } = data.value;
      this.logger.debug('trigger data:', data.value);

      const srcAddress = Utils.isETHLike(account.blockchainId) ? tx.sourceAddresses : tx.owner;

      const bridgeDetailModel = await ModelFactory.create({ database: this.database, struct: 'bridgeDetail' });
      const { struct: structBD } = bridgeDetailModel;
      structBD.srcChainId = account.blockchainId;
      structBD.id = account.id;
      structBD.srcTokenAddress = account.type === 'token' ? account.contract : '0x0000000000000000000000000000000000000000';
      structBD.srcAddress = srcAddress;
      structBD.srcTxHash = tx.txid;
      structBD.receivedTimestamp = tx.timestamp;
      structBD.finalized = false;
      structBD.amount = tx.amount;
      structBD.triggerData = JSON.stringify(data.value);

      const jobListItem = await ModelFactory.create({ database: this.database, struct: 'jobListItem' });
      const { struct: structJLI } = jobListItem;
      structJLI.srcChainId = account.blockchainId;
      structJLI.srcTxHash = tx.txid;
      structJLI.step = 1;

      await bridgeDetailModel.save();
      await jobListItem.save();
    } catch (error) {
      this.logger.error(error);
      setTimeout(this.createJob(data), 1000);
    }
  }

  // temp
  async receivedAddress() {
    const res = await this.tw.overview();
    const curAndAddr = [];
    for (const cur of res.currencies) {
      if (cur.type === 'currency') {
        const addr = await this.tw.getReceivingAddress(cur.id);
        if (addr) {
          curAndAddr.push({
            blockchainId: cur.blockchainId,
            name: cur.name,
            address: addr,
          });
        }
      }
    }

    return new ResponseFormat({
      message: '',
      payload: {
        addresses: curAndAddr,
      },
    });
  }

  async registDeposit({ params }) {
    try {
      const { blockchainId, address } = params;

      const overview = await this.tw.overview();
      const findCurrency = overview.currencies.find((cur) => (cur.type === 'currency' && cur.blockchainId === blockchainId));

      const ResAddr = await this.tw.getBridgeAccountReceive(findCurrency.id);
      console.log('ResAddr', ResAddr, typeof ResAddr);

      // don't await
      const recordRes = this._setDepositAddress(blockchainId, ResAddr.address, address);

      return new ResponseFormat({
        message: '',
        payload: {
          address: ResAddr,
        },
      });
    } catch (e) {
      this.logger.error(e);
      return new ResponseFormat({
        message: 'registDeposit error',
      });
    }
  }

  async registWithdraw({ params, body }) {
    try {
      const { blockchainId, fromAddress } = params;
      const { toAddress } = body;

      // don't await
      const recordRes = this._setWithdrawAddress(blockchainId, fromAddress, toAddress);

      return new ResponseFormat({
        message: '',
        payload: {
          success: true,
        },
      });
    } catch (e) {
      this.logger.error(e);
      return new ResponseFormat({
        message: 'registDeposit error',
      });
    }
  }

  async _setDepositAddress(chainId, fromAddress, toAddress, retry = 0) {
    try {
      const transaction = new Transaction({});
      transaction.accountId = this._accountInfo.id;
      transaction.amount = '0';
      transaction.to = this.config.blockchain.base.addressMappingAddress;

      // make address mapping data
      transaction.message = AddressMappingDataBuilder.encodeSetDepositAddress({
        chainId,
        fromAddress,
        toAddress,
      });

      // get fee
      const resFee = await this.tw.getTransactionFee({
        id: this._accountInfo.id,
        to: transaction.to,
        amount: '0',
        data: transaction.message,
      });
      transaction.feePerUnit = resFee.feePerUnit.fast;
      transaction.feeUnit = resFee.unit;
      transaction.fee = (new BigNumber(transaction.feePerUnit)).multipliedBy(transaction.feeUnit).toFixed();

      this.logger.debug('_setDepositAddress transaction', transaction);
      const res = await this.tw.sendTransaction(this._accountInfo.id, transaction.data);
      this.logger.debug('_setDepositAddress transaction res', res);
      if (!res) {
        throw new Error(`_setDepositAddress sendTransaction fail. res: ${JSON.stringify(res)}`);
      }
      return res;
    } catch (error) {
      this.logger.error(error);
      if (retry < 3) {
        retry += 1;
        this._setDepositAddress(chainId, fromAddress, toAddress, retry);
      }
    }
  }

  async _setWithdrawAddress(chainId, fromAddress, toAddress, retry = 0) {
    try {
      const transaction = new Transaction({});
      transaction.accountId = this._accountInfo.id;
      transaction.amount = '0';
      transaction.to = this.config.blockchain.base.addressMappingAddress;

      // make address mapping data
      transaction.message = AddressMappingDataBuilder.encodeSetWithdrawAddress({
        chainId,
        fromAddress,
        toAddress,
      });

      // get fee
      const resFee = await this.tw.getTransactionFee({
        id: this._accountInfo.id,
        to: transaction.to,
        amount: '0',
        data: transaction.message,
      });
      transaction.feePerUnit = resFee.feePerUnit.fast;
      transaction.feeUnit = resFee.unit;
      transaction.fee = (new BigNumber(transaction.feePerUnit)).multipliedBy(transaction.feeUnit).toFixed();

      this.logger.debug('_setWithdrawAddress transaction', transaction);
      const res = await this.tw.sendTransaction(this._accountInfo.id, transaction.data);
      this.logger.debug('_setWithdrawAddress transaction res', res);
      if (!res) {
        throw new Error(`_setWithdrawAddress sendTransaction fail. res: ${JSON.stringify(res)}`);
      }
      return res;
    } catch (error) {
      this.logger.error(error);
      if (retry < 3) {
        retry += 1;
        this._setWithdrawAddress(chainId, fromAddress, toAddress, retry);
      }
    }
  }
}

module.exports = Bridge;
