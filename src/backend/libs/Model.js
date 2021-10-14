/* eslint-disable no-unused-vars */

const Structs = require('../structs');
const DataType = require('../structs/datatype');
const Codes = require('./Codes');

class Model {
  constructor({ database, struct }) {
    this.myStruct = Structs[struct];
    if (!this.myStruct) {
      return Promise.reject(new Error(`Struct '${struct}' is not support.`));
    }
    this.db = database.leveldb;
    this.myTableName = struct;
    Object.keys(this.myStruct).forEach((key) => {
      this[key] = DataType[this.myStruct[key]];
    });
    return Promise.resolve(this);
  }

  async save() {
    // return Promise.resolve(this);
    try {
      const data = JSON.parse(JSON.stringify(this));
      if (data.key && data.key !== '') {
        const dataKeys = Object.keys(data);
        const valueIndex = (dataKeys.indexOf('key') + 1) % dataKeys.length;
        await this.db.put(data.key, data[dataKeys[valueIndex]]);
      } else {
        throw new Error({ message: 'Should include key.', code: Codes.DB_SAVE_FAIL });
      }
    } catch (e) {
      console.trace('Save failed.', e);
      throw new Error({ message: `Save ${this.myTableName} to level db failed.`, code: Codes.DB_SAVE_FAIL });
    }
  }

  async find({ condition }) {
    try {
      if (!condition) {
        return Promise.reject(new Error('Condition should not be null.'));
      }
      const thisKeys = Object.keys(this);
      const conditionKeys = Object.keys(condition);
      for (let i = 0; i < conditionKeys.length; i++) {
        const key = conditionKeys[i];
        const keyIndex = thisKeys.indexOf(key);
        if (keyIndex !== -1) {
          const valueIndex = (keyIndex + 1) % thisKeys.length;
          try {
            this[key] = condition[key];
            const value = await this.db.get(condition[key]);
            this[thisKeys[valueIndex]] = value;
          } catch (e) {
            if (e.type !== 'NotFoundError') throw e;
          }
        }
      }
      return this;
    } catch (e) {
      console.trace('Find failed.', e);
      throw new Error({ message: `Qurey ${this.myTableName} from level db failed.`, code: Codes.DB_FIND_FAIL });
    }
  }

  _tableName() {
    return String(this.myTableName);
  }
}

module.exports = Model;
