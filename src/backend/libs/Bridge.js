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

      .then(async () => {
      // testdb
        const bridgeDetailModel = await ModelFactory.create({ database: this.database, struct: 'bridgeDetail' });
        bridgeDetailModel.key = '123';
        bridgeDetailModel.srcChainID = '8000003C';
        bridgeDetailModel.srcAddress = '0x3841C791e5d10595B665F9b118877e28d1327Ee8';
        await ModelFactory.save(bridgeDetailModel);

        const res = await ModelFactory.find({ database: this.database, struct: 'bridgeDetail', condition: { key: '123' } });
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
