/* eslint-disable no-fallthrough */
const BigNumber = require('bignumber.js');

const Bot = require('./Bot');
const ModelFactory = require('./ModelFactory');
const { JOB_STATE } = require('../structs/jobListItem');
const Transaction = require('../structs/Transaction');
const TokenManagerDataBuilder = require('./TokenManagerDataBuilder');
const JsonRpc = require('./JsonRpc');

const JOB_INTERVAL = 1000;
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
        this.workingList = {};
        this._baseChain = this.config.blockchain.base;
      })
      .then(() => this);
  }

  start() {
    return super.start()
      .then(async () => {
        const br = await this.getBot('Bridge');
        this.tw = br.tw;
        const overview = await this.tw.overview();
        this._accountInfo = overview.currencies.find((info) => (info.blockchainId === this._baseChain.blockchainId
            && info.type === 'currency'));
      })
      .then(() => {
        this.getJob();
      })
      .then(() => this);

    // // testdb
    //   .then(async () => {
    //     const bridgeDetailModel = await ModelFactory.create({ database: this.database, struct: 'bridgeDetail' });
    //     const { struct } = bridgeDetailModel;
    //     // struct.pk = '123';
    //     struct.srcChainId = '80001F51';
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

    // // test Work
    // .then(async () => {
    //   const jobListItem = await ModelFactory.create({ database: this.database, struct: 'jobListItem' });
    //   const { struct: structJLI } = jobListItem;
    //   structJLI.srcChainId = '8000003C';
    //   structJLI.srcTxHash = '0x7c2c0b576fb618926694dd64c81626e2b3781d5d6dd4b7d47da801dc70c3ed5a';
    //   structJLI.step = 1;
    //   await jobListItem.save();

    //   const findPrefix = await ModelFactory.findPrefix({
    //     database: this.database,
    //     struct: 'jobListItem',
    //     condition: {
    //       key: JOB_STATE.PENDING,
    //       limit: 5,
    //     },
    //   });
    //   console.log('findPrefix res:', findPrefix);

    //   await this.finishJob(structJLI);

    //   const findPrefix2 = await ModelFactory.findPrefix({
    //     database: this.database,
    //     struct: 'jobListItem',
    //     condition: {
    //       key: JOB_STATE.PENDING,
    //       limit: 5,
    //     },
    //   });
    //   console.log('findPrefix2 res:', findPrefix2);

    //   const findPrefix3 = await ModelFactory.findPrefix({
    //     database: this.database,
    //     struct: 'jobListItem',
    //     condition: {
    //       key: JOB_STATE.DONE,
    //       limit: 5,
    //     },
    //   });
    //   console.log('findPrefix3 res:', findPrefix3);
    // });
  }

  async getJob() {
    // 1. get job from db
    // 2. do job
    // 3. update job
    // 4. finish job
    // 5. set timeount and call get job
    try {
      const res = await ModelFactory.findPrefix({
        database: this.database,
        struct: this.tableName,
        condition: {
          key: JOB_STATE.PENDING,
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
      setTimeout(() => {
        this.getJob();
      }, JOB_INTERVAL);
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
    console.log('doJob', jobListItemStruct);
    try {
      // get bridgeDetail
      const detailModel = await ModelFactory.find({
        database: this.database,
        struct: 'bridgeDetail',
        condition: {
          key: jobListItemStruct.bridgeDetailKey,
        },
      });
      console.log('detailModel', detailModel.struct);
      console.log('is deposit', this.isDeposit(jobListItemStruct.srcChainId));

      if (this.isDeposit(jobListItemStruct.srcChainId)) {
        // 1. call contract mint
        // 2. finish

        switch (jobListItemStruct.step) {
          case 1:
            await this._depositStep1(jobListItemStruct, detailModel);
          case 2:
            await this.finishJob(jobListItemStruct, detailModel);
          default:
        }
        delete this.workingList[jobListItemStruct.pk];
      } else {
        // prepare: get chainId and from contract address from shadow token contract
        // 1. transfer target asset to user
        // 2. call contract burn
        // 3. finish

        const jsonrpc = new JsonRpc(this._baseChain);
        const targetAsset = {
          chainId: await jsonrpc.getShadowTokenChainId(detailModel.struct.srcTokenAddress),
          contractAddress: await jsonrpc.getShadowTokenFromContractAddress(detailModel.struct.srcTokenAddress),
        };
        switch (jobListItemStruct.step) {
          case 1:
          case 2:
          case 3:
        }
      }
    } catch (e) {
      console.trace('doJob failed', e);
      delete this.workingList[jobListItemStruct.pk];
    }
    return true;
  }

  async finishJob(jobListItemStruct, detailModel) {
    const oriPk = jobListItemStruct.pk;
    try {
      // 1. save ori pk
      // 2. save new pk with DONE_PREFIX
      // 3. save jobListItem with newPk into db
      // 4. remove oriPk from db
      // 5. remove workingList

      const jobListItemModelNew = await ModelFactory.create({
        database: this.database,
        struct: this.tableName,
      });

      jobListItemModelNew.struct = jobListItemStruct;
      jobListItemModelNew.struct.finalized = true;
      detailModel.struct.finalized = true;

      await detailModel.save();
      const saveRes = await jobListItemModelNew.save();

      const removeRes = await ModelFactory.remove({
        database: this.database,
        struct: this.tableName,
        condition: {
          key: oriPk,
        },
      });

      delete this.workingList[oriPk];
    } catch (e) {
      console.trace('finishJob failed.', e);
      delete this.workingList[oriPk];
    }
  }

  async updateJob(jobListItemStruct, detailModel) {
    try {
      jobListItemStruct.step += 1;

      await detailModel.save();
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
    }
  }

  /**
   *
   * @param {string} srcChainId
   * @returns
   */
  isDeposit(srcChainId) {
    return srcChainId.toLowerCase() !== this._baseChain.blockchainId.toLowerCase();
    // return true;
  }

  async getMappingAddress(blockchainId, address) {
    // find from contract
    return address;
  }

  async _depositStep1(jobListItemStruct, detailModel) {
    // get overview
    console.log('detailModel.struct.accountId', detailModel.struct.accountId);
    const overview = await this.tw.overview();
    const srcInfo = overview.currencies.find((info) => (info.accountId === detailModel.struct.accountId));

    const transaction = new Transaction({});
    transaction.accountId = this._accountInfo.accountId;
    transaction.amount = '0';
    transaction.to = this._baseChain.tokenManagerAddress;

    // get mapping address
    const userAddress = await this.getMappingAddress(detailModel.struct.blockchainId, detailModel.struct.srcAddress);

    // caculate amount to smallest unit
    const bnAmount = new BigNumber(detailModel.struct.amount);
    const bnDecimals = (new BigNumber(10)).pow(srcInfo.decimals);
    const amount = bnAmount.multipliedBy(bnDecimals).toFixed();

    // make token manager data
    transaction.message = TokenManagerDataBuilder.encodeMintToken({
      name: srcInfo.name,
      symbol: srcInfo.symbol,
      decimals: srcInfo.decimals,
      chainId: detailModel.struct.srcChainId,
      fromContractAddress: detailModel.struct.srcTokenAddress,
      userAddress,
      amount,
      txHash: detailModel.struct.srcTxHash,
    });

    // get fee
    const resFee = await this.tw.getTransactionFee({
      id: this._accountInfo.accountId,
      to: this._baseChain.tokenManagerAddress,
      amount: '0',
      data: transaction.message,
    });
    transaction.feePerUnit = resFee.feePerUnit.standard;
    transaction.feeUnit = resFee.unit;
    transaction.fee = (new BigNumber(transaction.feePerUnit)).multipliedBy(transaction.feeUnit).toFixed();

    console.log(transaction);
    // send transaction mint
    const res = await this.tw.sendTransaction(this._accountInfo.accountId, transaction);
    console.log('transaction res', res);
    if (res) {
      jobListItemStruct.destTxHash = res;
      jobListItemStruct.mintOrBurnTxHash = res;
      detailModel.struct.destTxHash = res;
      detailModel.struct.mintOrBurnTxHash = res;
      await this.updateJob(jobListItemStruct, detailModel);
    } else {
      throw new Error('sendTransaction fail.');
    }
  }
}

module.exports = Worker;
