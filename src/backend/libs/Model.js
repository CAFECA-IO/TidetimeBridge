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
        const res = await this._save(data);
        return res;
      }
      throw new Error('Should include key.');
    } catch (e) {
      console.trace('Save failed.', e);
      throw e;
    }
  }

  async _save(data) {
    const res = await this.db.put(data.key, data);
    return res;
  }

  async find({ condition }) {
    try {
      if (!condition) {
        return Promise.reject(new Error('Condition should not be null.'));
      }
      const res = this._find({ condition });
      this.struct = new Structs[this.tableName](res);
      return this;
    } catch (e) {
      console.trace('Find failed.', e);
      throw e;
    }
  }

  async _find({ condition }) {
    const res = await this.db.get(condition);
    return res;
  }

  async update({ condition, data }) {
    try {
      const findRes = await this._find({ condition });
      this.struct = new Structs[this.tableName](findRes);
      for (const key of Object.keys(data)) {
        this.struct[key] = data[key];
      }
      await this._save(this.struct.data);

      return this;
    } catch (e) {
      console.trace('update failed.', e);
      throw e;
    }
  }

  _tableName() {
    return String(this.tableName);
  }
}

module.exports = Model;
