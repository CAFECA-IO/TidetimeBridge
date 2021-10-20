const Structs = require('../structs');

class Model {
  constructor({ database, struct }) {
    const StructClass = Structs[struct];
    if (!StructClass) {
      return Promise.reject(new Error(`Struct '${struct}' is not support.`));
    }
    this.db = database;
    this.tableName = struct;
    this.struct = new StructClass({});
    return Promise.resolve(this);
  }

  _getSaveKey(key) { return `${this.tableName}.${key}`; }

  async save() {
    // return Promise.resolve(this);
    try {
      const { data, check } = this.struct;
      if (check) {
        const res = await this._save(data);
        return res;
      }
      throw new Error('Should include pk.');
    } catch (e) {
      console.trace('Save failed.', e);
      throw e;
    }
  }

  async _save(data) {
    const key = this._getSaveKey(data.pk);
    const res = await this.db.put(key, data);
    return res;
  }

  async find({ condition }) {
    try {
      if (!condition.key) {
        return Promise.reject(new Error('key should not be null.'));
      }
      const res = await this._find(condition.key);
      this.struct = new Structs[this.tableName](res);
      return this;
    } catch (e) {
      console.trace('Find failed.', e);
      throw e;
    }
  }

  async _find(key) {
    const thisKey = this._getSaveKey(key);
    const res = await this.db.get(thisKey);
    return res;
  }

  async findPrefix({ condition }) {
    try {
      const res = await this._findPrefix(condition);
      return res;
    } catch (e) {
      console.trace('findPrefix failed.', e);
      throw e;
    }
  }

  async _findPrefix(condition) {
    const thisKey = this._getSaveKey(condition.key);
    const option = {
      gte: thisKey,
      lte: thisKey.substring(0, thisKey.length - 1)
        + String.fromCharCode(thisKey[thisKey.length - 1].charCodeAt() + 1),
    };
    if (condition.limit) {
      option.limit = condition.limit;
    }
    const readRes = this.db.createReadStream(option);
    const res = [];
    for await (const data of readRes) {
      res.push(data);
    }
    return res;
  }

  async update({ condition, data }) {
    try {
      if (!condition.key) {
        return Promise.reject(new Error('key should not be null.'));
      }
      const findRes = await this._find(condition.key);
      this.struct = new Structs[this.tableName](findRes);
      for (const dataKey of Object.keys(data)) {
        this.struct[dataKey] = data[dataKey];
      }
      await this._save(this.struct.data);

      return this;
    } catch (e) {
      console.trace('update failed.', e);
      throw e;
    }
  }

  async remove({ condition }) {
    // return Promise.resolve(this);
    try {
      if (!condition.key) {
        return Promise.reject(new Error('key should not be null.'));
      }
      const res = await this._remove(condition.key);
      return res;
    } catch (e) {
      console.trace('Save failed.', e);
      throw e;
    }
  }

  async _remove(key) {
    const thisKey = this._getSaveKey(key);
    const res = await this.db.del(thisKey);
    return res;
  }

  _tableName() {
    return String(this.tableName);
  }
}

module.exports = Model;
