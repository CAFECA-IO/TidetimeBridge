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
      .then(() => this);
  }

  start() {
    return super.start()
    // .then(() => this);

      // testdb
      .then(async () => {
        const bridgeDetailModel = await ModelFactory.create({ database: this.database, struct: 'bridgeDetail' });
        const { struct } = bridgeDetailModel;
        // struct.key = '123';
        struct.srcChainID = '8000003C';
        struct.srcAddress = '0x3841C791e5d10595B665F9b118877e28d1327Ee8';
        struct.srcTxHash = '0x7c2c0b576fb618926694dd64c81626e2b3781d5d6dd4b7d47da801dc70c3ed5a';
        await ModelFactory.save(bridgeDetailModel);

        const res = await ModelFactory.find({ database: this.database, struct: 'bridgeDetail', condition: struct.key });
        console.log('read res:', res);
        return this;
      });
  }

  ready() {
    return super.ready()
      .then(() => this);
  }
}

module.exports = Bridge;
