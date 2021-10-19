const Bot = require('./Bot');
const ModelFactory = require('./ModelFactory');

const JOB_INTERVAL = 1000;
const DONE_PREFIX = 'DONE-';
const MAX_WORKER = 10;

class Worker extends Bot {
  constructor() {
    super();
    this.name = 'Worker';
    this.tableName = 'jobListItem';
  }

  init({
    config, database, logger, i18n,
  }) {
    return super.init({
      config, database, logger, i18n,
    })
      .then(() => {
        this.working = false;
        this.workingList = {};
      })
      .then(() => this);
  }

  start() {
    return super.start()
      .then(() => {
        this.getJob();
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

    //     const removeRes = await ModelFactory.remove({
    //       database: this.database,
    //       struct: 'bridgeDetail',
    //       condition: {
    //         key: struct.pk,
    //       },
    //     });
    //     console.log('removeRes:', removeRes);
    //     const findPrefix2 = await ModelFactory.findPrefix({
    //       database: this.database,
    //       struct: 'bridgeDetail',
    //       condition: {
    //         key: '',
    //         limit: 5,
    //       },
    //     });
    //     console.log('findPrefix res2:', findPrefix2);

    //     return this;
    //   });
  }

  async getJob() {
    // 1. get job from db
    // 2. do job
    // 3. update job
    // 4. finish job
    // 5. call getjob
    // 6. if no job set timeount and call get job
    try {
      if (this.working) {
        console.warn('get job fail, is working');
        return;
      }
      this.working = true;
      const res = await ModelFactory.findPrefix({
        database: this.database,
        struct: this.tableName,
        condition: {
          key: '',
          limit: MAX_WORKER,
        },
      });

      // add working list
      for (const jobData of res) {
        if (!this.workingList[jobData.value.pk]) {
          this.workingList[jobData.value.pk] = jobData.value;
          const StructClass = ModelFactory.getStructClass(this.tableName);
          const jobListItemStruct = new StructClass(jobData.value);
          this.doJob(jobListItemStruct);
        }
      }

      // set interval
      if (Object.keys(this.workingList).length === 0) {
        setTimeout(() => {
          this.getJob();
        }, JOB_INTERVAL);
      }
    } catch (e) {
      console.trace('getJob failed.', e);
      setTimeout(() => {
        this.getJob();
      }, JOB_INTERVAL);
      return e;
    }
    return true;
  }

  async doJob(jobListItemStruct) {
    return true;
  }

  async finishJob(jobListItemStruct) {
    const oriPk = jobListItemStruct.pk;
    try {
      // 1. save ori pk
      // 2. save new pk with DONE_PREFIX
      // 3. save jobListItem with newPk into db
      // 4. remove oriPk from db
      // 5. remove workingList
      // 6. call getjob
      const newPk = `${DONE_PREFIX}${jobListItemStruct.pk}`;

      const jobListItemModelNew = await ModelFactory.create({
        database: this.database,
        struct: this.tableName,
      });

      jobListItemModelNew.struct = jobListItemStruct;
      jobListItemModelNew.struct.pk = newPk;
      const saveRes = await jobListItemModelNew.save();

      const removeRes = await ModelFactory.remove({
        database: this.database,
        struct: this.tableName,
        condition: {
          key: oriPk,
        },
      });

      delete this.workingList[oriPk];

      this.getJob();
    } catch (e) {
      console.trace('finishJob failed.', e);
      delete this.workingList[oriPk];

      this.getJob();
    }
  }

  async updateJob(jobListItemStruct) {
    try {
      const res = await ModelFactory.update({
        database: this.database,
        struct: this.tableName,
        condition: {
          key: jobListItemStruct.pk,
        },
        data: jobListItemStruct.data,
      });
      console.log(res);
    } catch (e) {
      console.trace('updateJob failed', e);
      delete this.workingList[jobListItemStruct.pk];
      this.getJob();
    }
  }
}

module.exports = Worker;
