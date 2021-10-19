const TideWallet = require('@cafeca/tidewalletjs/src/index');
const Bot = require('./Bot');
const ModelFactory = require('./ModelFactory');

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
          this.createJob(data);
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

    // // testdb
    //   .then(async () => {
    //     const bridgeDetailModel = await ModelFactory.create({ database: this.database, struct: 'bridgeDetail' });
    //     const { struct } = bridgeDetailModel;
    //     // struct.key = '123';
    //     struct.srcChainID = '8000003C';
    //     struct.srcAddress = '0x3841C791e5d10595B665F9b118877e28d1327Ee8';
    //     struct.srcTxHash = '0x7c2c0b576fb618926694dd64c81626e2b3781d5d6dd4b7d47da801dc70c3ed5a';
    //     await ModelFactory.save(bridgeDetailModel);

    //     const readRes = await ModelFactory.find({ database: this.database, struct: 'bridgeDetail', condition: struct.key });
    //     console.log('read res:', readRes);

    //     const updateRes = await ModelFactory.update({
    //       database: this.database, struct: 'bridgeDetail', condition: struct.key, data: { amount: 10, finalized: true },
    //     });
    //     console.log('update res:', updateRes);
    //     return this;
    //   });
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
      structBD.srcChainID = account.blockchainId;
      structBD.srcTokenAddress = account.type === 'token' ? account.contract : '0x0000000000000000000000000000000000000000';
      structBD.srcAddress = tx.sourceAddresses;
      structBD.srcTxHash = tx.txid;
      structBD.receivedTimestamp = tx.timestamp;
      structBD.finalized = false;

      const jobListItem = await ModelFactory.create({ database: this.database, struct: 'jobListItem' });
      const { struct: structJLI } = jobListItem;
      structJLI.srcChainID = account.blockchainId;
      structJLI.srcTxHash = tx.txid;
      structJLI.step = 1;

      await bridgeDetailModel.save();
      await jobListItem.save();
    } catch (error) {
      setTimeout(this.createJob(data), 1000);
    }
  }
}

module.exports = Bridge;
