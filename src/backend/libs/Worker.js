const Bot = require('./Bot');
const ModelFactory = require('./ModelFactory');

class Worker extends Bot {
  constructor() {
    super();
    this.name = 'Worker';
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
        // struct.pk = '123';
        struct.srcChainID = '80001F51';
        struct.srcAddress = '0x3841C791e5d10595B665F9b118877e28d1327Ee8';
        struct.srcTxHash = '0x7c2c0b576fb618926694dd64c81626e2b3781d5d6dd4b7d47da801dc70c3ed5a';
        await ModelFactory.save(bridgeDetailModel);

        const readRes = await ModelFactory.find({ database: this.database, struct: 'bridgeDetail', condition: { key: struct.pk } });
        console.log('read res:', readRes);

        const findPrefix = await ModelFactory.findPrefix({
          database: this.database,
          struct: 'bridgeDetail',
          condition: {
            key: '',
            limit: 5,
          },
        });
        console.log('findPrefix res:', findPrefix);

        const updateRes = await ModelFactory.update({
          database: this.database, struct: 'bridgeDetail', condition: { key: struct.pk }, data: { amount: 10, finalized: true },
        });
        console.log('update res:', updateRes);
        return this;
      });
  }

  ready() {
    return super.ready()
      .then(() => this);
  }

  async getJob() {
    return true;
  }

  async doJob() {
    return true;
  }

  async finishJob() {
    return true;
  }

  async updateJob() {
    return true;
  }
}

module.exports = Worker;
