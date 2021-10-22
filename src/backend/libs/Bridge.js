const TideWallet = require('@cafeca/tidewalletjs/src/index');
const Bot = require('./Bot');
const ModelFactory = require('./ModelFactory');
const ResponseFormat = require('./ResponseFormat');

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
        this.tw = new TideWallet();
        this.tw.on('ready', () => { console.log('TideWallet is Ready'); });
        this.tw.on('notice', (data) => {
          console.log('TideWallet get Notice');
          console.log(data);
          if (data.value.tx.direction === 'receive') { this.createJob(data); }
        });
        this.tw.on('update', () => { console.log('TideWallet Data Updated'); });

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
      .then(() => this);
  }

  ready() {
    return super.ready()
      .then(() => this);
  }

  async createJob(data) {
    try {
      const { account, tx } = data.value;

      const bridgeDetailModel = await ModelFactory.create({ database: this.database, struct: 'bridgeDetail' });
      const { struct: structBD } = bridgeDetailModel;
      structBD.srcChainId = account.blockchainId;
      structBD.accountId = account.accountId;
      structBD.srcTokenAddress = account.type === 'token' ? account.contract : '0x0000000000000000000000000000000000000000';
      structBD.srcAddress = tx.sourceAddresses;
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
}

module.exports = Bridge;
