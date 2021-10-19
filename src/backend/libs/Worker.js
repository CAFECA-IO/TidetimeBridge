const Bot = require('./Bot');
const ModelFactory = require('./ModelFactory');

const JOB_INTERVAL = 1000;
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
      .then(() => {
        this.working = false;
      })
      .then(() => this);
  }

  start() {
    return super.start()
      .then(() => {
        this.getJob();
        this.getJobInterval = setInterval(async () => {
          await this.getJob();
        }, JOB_INTERVAL);
      })
      .then(() => this);

    // // testdb
    //   .then(async () => {
    //     const bridgeDetailModel = await ModelFactory.create({ database: this.database, struct: 'bridgeDetail' });
    //     const { struct } = bridgeDetailModel;
    //     // struct.pk = '123';
    //     struct.srcChainID = '80001F51';
    //     struct.srcAddress = '0x3841C791e5d10595B665F9b118877e28d1327Ee8';
    //     struct.srcTxHash = '0x7c2c0b576fb618926694dd64c81626e2b3781d5d6dd4b7d47da801dc70c3ed5a';
    //     await ModelFactory.save(bridgeDetailModel);

    //     const readRes = await ModelFactory.find({ database: this.database, struct: 'bridgeDetail', condition: { key: struct.pk } });
    //     console.log('read res:', readRes);

    //     const findPrefix = await ModelFactory.findPrefix({
    //       database: this.database,
    //       struct: 'bridgeDetail',
    //       condition: {
    //         key: '',
    //         limit: 5,
    //       },
    //     });
    //     console.log('findPrefix res:', findPrefix);

    //     const updateRes = await ModelFactory.update({
    //       database: this.database, struct: 'bridgeDetail', condition: { key: struct.pk }, data: { amount: 10, finalized: true },
    //     });
    //     console.log('update res:', updateRes);
    //     return this;
    //   });
  }

  async getJob() {
    try {
      if (this.working) {
        console.warn('get job fail, is working');
        return;
      }
      this.working = true;
      const res = await ModelFactory.findPrefix({
        database: this.database,
        struct: 'jobListItem',
        condition: {
          key: '',
          limit: 1,
        },
      });
      if (res && res.length > 0) {
        const [jobData] = res;
        const StructClass = ModelFactory.getStructClass('jobListItem');
        const jobListItemStruct = new StructClass(jobData.value);
        await this.doJob(jobListItemStruct);
      }

      this.working = false;
    } catch (e) {
      console.log('getJob failed.', e);
      this.working = false;
      return e;
    }
    return true;
  }

  async doJob(jobListItemStruct) {
    return true;
  }

  async finishJob() {
    return true;
  }

  async updateJob(jobListItemStruct) {
    try {
      const res = await ModelFactory.update({
        database: this.database,
        struct: 'jobListItem',
        condition: {
          key: jobListItemStruct.pk,
        },
        data: jobListItemStruct.data,
      });
      console.log(res);
    } catch (e) {
      console.trace('updateJob failed', e);
      throw e;
    }
    return true;
  }
}

module.exports = Worker;
