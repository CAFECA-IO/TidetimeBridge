/* eslint-disable no-fallthrough */
const BigNumber = require('bignumber.js');

const Bot = require('./Bot');
const ModelFactory = require('./ModelFactory');
const { JOB_STATE } = require('../structs/jobListItem');
const Transaction = require('../structs/Transaction');
const TokenManagerDataBuilder = require('./TokenManagerDataBuilder');
const AddressMappingDataBuilder = require('./AddressMappingDataBuilder');
const JsonRpc = require('./JsonRpc');
const SupportChain = require('./SupportChain');
const Utils = require('./Utils');
const SmartContract = require('./SmartContract');

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

        this._bridgeAddress = await this.tw.getReceivingAddress(this._accountInfo.id);
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

    // // resend nonce to cancel
    //   .then(async () => {
    //     const tx = {};
    //     // tx.accountId = 'eb5e61d0-6396-4c4f-a8b5-49a85b508fc3';
    //     // tx.accountId = '87ceb934-fb50-4db8-8e50-4a225dab6f3f';
    //     tx.accountId = '55b609e5-982e-450a-97d9-f4c27c16df2e'; // temp staging

    //     tx.amount = '0';
    //     // tx.to = '0x4827a06af81060bfa9353a065b25ce0598fce833';
    //     // tx.to = '0xa4a6f7090962f65a3dbf5f66dd2ee4184b7c7da7';
    //     tx.to = '0x9e70e26a243071fe670648e9564e1e870de2b873';// temp stanging
    //     tx.nonce = 2;

    //     // get fee
    //     const resFee = await this.tw.getTransactionFee({
    //       id: tx.accountId,
    //       to: tx.to,
    //       amount: '0',
    //       data: '0x',
    //     });
    //     tx.feePerUnit = resFee.feePerUnit.fast;
    //     tx.feeUnit = resFee.unit;
    //     tx.fee = (new BigNumber(tx.feePerUnit)).multipliedBy(tx.feeUnit).toFixed();

    //     console.log('_depositStep1 transaction', tx);
    //     // send transaction mint
    //     const res = await this.tw.sendTransaction(this._accountInfo.accountId, tx);
    //     console.log('_depositStep1 transaction res', res);
    //   });
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
      this.logger.trace('getJob failed.', e);
      setTimeout(() => {
        this.getJob();
      }, JOB_INTERVAL);
      return e;
    }
    return true;
  }

  async doJob(jobListItemStruct) {
    this.logger.debug('doJob', jobListItemStruct);
    try {
      // get bridgeDetail
      const detailModel = await ModelFactory.find({
        database: this.database,
        struct: 'bridgeDetail',
        condition: {
          key: jobListItemStruct.bridgeDetailKey,
        },
      });
      this.logger.debug('detailModel', detailModel.struct);

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
        // 2. check transfer success
        // 3. call contract burn
        // 4. finish

        const targetAsset = await this.getTargetAssetInfoFromToken(detailModel);
        if (targetAsset.notExist) {
          // not shadow token
          this.logger.error(`${detailModel.struct.srcTokenAddress} is not shadow asset.`);
          const removeRes = await ModelFactory.remove({
            database: this.database,
            struct: this.tableName,
            condition: {
              key: jobListItemStruct.pk,
            },
          });
          delete this.workingList[jobListItemStruct.pk];
          return true;
        }

        // get overview
        const overview = await this.tw.overview();
        this.logger.debug('targetAsset:', targetAsset);
        const targetInfo = overview.currencies.find((info) => {
          const contractAddr = info.type === 'token' ? `0x${Utils.leftPad32(info.contract.replace('0x', ''))}` : `0x${Utils.leftPad32('0')}`;
          return (targetAsset.chainId.toLowerCase() === info.blockchainId.toLowerCase()) && (targetAsset.contractAddress === contractAddr);
        });
        this.logger.debug('targetInfo:', targetInfo);

        switch (jobListItemStruct.step) {
          case 1:
            await this._withdrawStep1(jobListItemStruct, detailModel, targetInfo);
          case 2:
            await this._withdrawStep2(jobListItemStruct, detailModel, targetInfo);
          case 3:
            await this._withdrawStep3(jobListItemStruct, detailModel, targetInfo);
          case 4:
            await this.finishJob(jobListItemStruct, detailModel);
          default:
        }
      }
    } catch (e) {
      this.logger.trace('doJob failed', e);
      delete this.workingList[jobListItemStruct.pk];
    }
    return true;
  }

  async finishJob(jobListItemStruct, detailModel) {
    const oriPk = jobListItemStruct.pk;
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
    this.logger.debug(saveRes);

    delete this.workingList[oriPk];
  }

  async updateJob(jobListItemStruct, detailModel, success) {
    if (success) {
      jobListItemStruct.step += 1;
    }

    await detailModel.save();
    const res = await ModelFactory.update({
      database: this.database,
      struct: this.tableName,
      condition: {
        key: jobListItemStruct.pk,
      },
      data: jobListItemStruct.data,
    });
    this.logger.debug(res);
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
    if (Utils.isETHLike(blockchainId)) return address;

    const jsonrpc = new JsonRpc(this._baseChain);
    let retry = 0;
    let addressEndoce;
    let addressDecoded;
    while (retry < 3) {
      try {
        addressEndoce = await jsonrpc.getMappingAddress(blockchainId, address);
        if (!addressEndoce) throw new Error('getMappingAddress something wrong');
        addressDecoded = SmartContract.parseString(addressEndoce);
        if (addressDecoded === '') throw new Error('mapping not found, maybe not on contract yet.', 400);
        break;
      } catch (error) {
        console.log('error', error);
        await Utils.sleep(3000);
        retry += 1;
      }
    }
    if (!addressDecoded) throw new Error('mapping not found.');

    return addressDecoded;
  }

  async getTargetAssetInfoFromToken(detailModel) {
    const jsonrpc = new JsonRpc(this._baseChain);
    const targetAsset = {
      chainId: await jsonrpc.getShadowTokenChainId(detailModel.struct.srcTokenAddress),
      contractAddress: await jsonrpc.getShadowTokenFromContractAddress(detailModel.struct.srcTokenAddress),
    };
    if (targetAsset.chainId === '0x' && targetAsset.contractAddress === '0x') {
      targetAsset.notExist = true;
    }
    return targetAsset;
  }

  async _depositStep1(jobListItemStruct, detailModel) {
    // get overview
    this.logger.debug('detailModel.struct.id', detailModel.struct.id);

    const transaction = new Transaction({});
    transaction.accountId = this._accountInfo.id;
    transaction.amount = '0';
    transaction.to = this._baseChain.tokenManagerAddress;

    // get mapping address
    const userAddress = await this.getMappingAddress(detailModel.struct.srcChainId, detailModel.struct.srcAddress);

    // caculate amount to smallest unit
    const bnAmount = new BigNumber(detailModel.struct.amount);
    const bnDecimals = (new BigNumber(10)).pow(detailModel.struct.decimals);
    const amount = bnAmount.multipliedBy(bnDecimals).toFixed();

    // make token manager data
    transaction.message = TokenManagerDataBuilder.encodeMintToken({
      name: detailModel.struct.name,
      symbol: detailModel.struct.symbol,
      decimals: detailModel.struct.decimals,
      chainId: detailModel.struct.srcChainId,
      fromContractAddress: detailModel.struct.srcTokenAddress,
      userAddress,
      amount,
      txHash: detailModel.struct.srcTxHash,
    });

    // get fee
    const resFee = await this.tw.getTransactionFee({
      id: this._accountInfo.id,
      to: this._baseChain.tokenManagerAddress,
      amount: '0',
      data: transaction.message,
    });
    transaction.feePerUnit = resFee.feePerUnit.fast;
    transaction.feeUnit = resFee.unit;
    transaction.fee = (new BigNumber(transaction.feePerUnit)).multipliedBy(transaction.feeUnit).toFixed();

    this.logger.debug('_depositStep1 transaction', transaction);
    // send transaction mint
    const res = await this.tw.sendTransaction(this._accountInfo.id, transaction.data);
    this.logger.debug('_depositStep1 transaction res', res);
    if (res) {
      jobListItemStruct.destTxHash = res;
      jobListItemStruct.mintOrBurnTxHash = res;
      detailModel.struct.destTxHash = res;
      detailModel.struct.mintOrBurnTxHash = res;
      await this.updateJob(jobListItemStruct, detailModel, true);
    } else {
      throw new Error('sendTransaction fail.');
    }
  }

  async _withdrawStep1(jobListItemStruct, detailModel, targetInfo) {
    this.logger.debug('_withdrawStep1 detailModel.struct.id', detailModel.struct.id);
    const transaction = new Transaction({});
    transaction.accountId = targetInfo.id;
    transaction.amount = detailModel.struct.amount;

    // get mapping address
    const userAddress = await this.getMappingAddress(detailModel.struct.blockchainId, detailModel.struct.srcAddress);
    transaction.to = userAddress;

    // get fee
    const resFee = await this.tw.getTransactionFee({
      id: targetInfo.id,
      to: userAddress,
      amount: transaction.amount,
      data: '0x',
    });
    transaction.feePerUnit = resFee.feePerUnit.fast;
    transaction.feeUnit = resFee.unit;
    transaction.fee = (new BigNumber(transaction.feePerUnit)).multipliedBy(transaction.feeUnit).toFixed();

    this.logger.debug('_withdrawStep1 transaction', transaction);
    // send transaction
    const res = await this.tw.sendTransaction(targetInfo.id, transaction.data);
    this.logger.debug('_withdrawStep1 transaction res', res);
    if (res) {
      jobListItemStruct.destTxHash = res;

      detailModel.struct.destChainId = targetInfo.blockchainId;
      detailModel.struct.destTxHash = res;
      detailModel.struct.destTokenAddress = targetInfo.type === 'token' ? targetInfo.contract : '0x0000000000000000000000000000000000000000';
      await this.updateJob(jobListItemStruct, detailModel, true);
    } else {
      throw new Error('sendTransaction fail.');
    }
  }

  async _withdrawStep2(jobListItemStruct, detailModel, targetInfo) {
    const jsonrpc = new JsonRpc(this.config.blockchain[SupportChain[targetInfo.blockchainId]]);

    const res = await jsonrpc.getTargetTxResult(jobListItemStruct.destTxHash);

    if (Utils.isETHLike(targetInfo.blockchainId)) {
      const receipt = res;
      let success = true;
      if (!receipt) {
        const pendingTxs = await jsonrpc.getTx(jobListItemStruct.destTxHash);
        this.logger.debug('pendingTxs', pendingTxs);
        if (pendingTxs) {
          await Utils.sleep(5000);
          throw new Error('receipt not found');
        } else {
          // ++ retry step1
          success = false;

          jobListItemStruct.step = 1;
          jobListItemStruct.destTxHash = '';

          detailModel.struct.step = 1;
          detailModel.struct.destTxHash = '';
          await this.updateJob(jobListItemStruct, detailModel, success);
          throw new Error('transaction has been thrown');
        }
      }
      if (receipt.status !== '0x1') {
        // fail, retry step1
        success = false;

        jobListItemStruct.step = 1;
        jobListItemStruct.destTxHash = '';

        detailModel.struct.step = 1;
        detailModel.struct.destTxHash = '';
      }
      await this.updateJob(jobListItemStruct, detailModel, success);
    }
  }

  async _withdrawStep3(jobListItemStruct, detailModel, targetInfo) {
    // get overview
    this.logger.debug('detailModel.struct.id', detailModel.struct.id);
    // const overview = await this.tw.overview();
    // const srcInfo = overview.currencies.find((info) => (info.accountId === detailModel.struct.id));

    const transaction = new Transaction({});
    transaction.accountId = this._accountInfo.id;
    transaction.amount = '0';
    transaction.to = this._baseChain.tokenManagerAddress;

    // caculate amount to smallest unit
    const bnAmount = new BigNumber(detailModel.struct.amount);
    const bnDecimals = (new BigNumber(10)).pow(targetInfo.decimals);
    const amount = bnAmount.multipliedBy(bnDecimals).toFixed();

    // make token manager data
    this.logger.debug('targetInfo', targetInfo);
    transaction.message = TokenManagerDataBuilder.encodeBurnToken({
      tokenAddress: detailModel.struct.srcTokenAddress,
      amount,
      userAddress: this._bridgeAddress,
      txHash: detailModel.struct.srcTxHash,
    });

    // get fee
    const resFee = await this.tw.getTransactionFee({
      id: this._accountInfo.id,
      to: this._baseChain.tokenManagerAddress,
      amount: '0',
      data: transaction.message,
    });
    transaction.feePerUnit = resFee.feePerUnit.fast;
    transaction.feeUnit = resFee.unit;
    transaction.fee = (new BigNumber(transaction.feePerUnit)).multipliedBy(transaction.feeUnit).toFixed();

    this.logger.debug('_withdrawStep3 transaction', transaction);
    // send transaction burn
    const res = await this.tw.sendTransaction(this._accountInfo.id, transaction.data);
    this.logger.debug('_withdrawStep3 transaction res', res);
    if (res) {
      jobListItemStruct.mintOrBurnTxHash = res;
      detailModel.struct.mintOrBurnTxHash = res;
      await this.updateJob(jobListItemStruct, detailModel, true);
    } else {
      throw new Error('_withdrawStep3 sendTransaction fail.');
    }
  }
}

module.exports = Worker;
