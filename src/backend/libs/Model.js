const Structs = require('../structs');

class Model {
  constructor({ database, struct }) {
    const StructClass = Structs[struct];
    if (!StructClass) {
      return Promise.reject(new Error(`Struct '${struct}' is not support.`));
    }
    const { leveldb } = database;
    this.db = leveldb;
    this.tableName = struct;
    this.struct = new StructClass({});
    return Promise.resolve(this);
  }

  async save() {
    // return Promise.resolve(this);
    try {
      const { data, check } = this.struct;
      console.log(check);
      console.log(data);
      if (check) {
        const res = await this.db.put(data.key, data);
        return res;
      }
      throw new Error('Should include key.');
    } catch (e) {
      console.trace('Save failed.', e);
      throw e;
    }
  }

  async find({ condition }) {
    try {
      if (!condition) {
        return Promise.reject(new Error('Condition should not be null.'));
      }
      const res = await this.db.get(condition);
      this.struct = new Structs[this.tableName](res);
      return this;
    } catch (e) {
      console.trace('Find failed.', e);
      throw e;
    }
  }

  _tableName() {
    return String(this.tableName);
  }
}

module.exports = Model;
