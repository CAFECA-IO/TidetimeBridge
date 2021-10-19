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
    const key = `${this.tableName}-${data.pk}`;
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
    const thisKey = `${this.tableName}-${key}`;
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
    const thisKey = `${this.tableName}-${condition.key}`;
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
      for (const thisKey of Object.keys(data)) {
        this.struct[thisKey] = data[thisKey];
      }
      await this._save(this.struct.data);

      return this;
    } catch (e) {
      console.trace('update failed.', e);
      throw e;
    }
  }

  async findNext({ condition }) {
    try {
      if (this.struct.nextKey === undefined) throw new Error('this struct do not support findNext.');

      // call by ModelFactory
      if (this.struct.pk === '' && condition.key) {
        const findModel = await this._find(condition.key);
        const res = await this._find(findModel.struct.nextKey);
        this.struct = new Structs[this.tableName](res);
        return this;
      }

      // call by model
      if (!!this.struct.pk && this.struct.nextKey) {
        const res = await this._find(this.struct.nextKey);
        const newModel = new Model({ database: this.db, struct: this.tableName });
        newModel.struct = new Structs[newModel.tableName](res);
        return newModel;
      }
      throw new Error('pk or nextKey not exist.');
    } catch (e) {
      console.trace('findNext failed.', e);
      throw e;
    }
  }

  async findPrev({ condition }) {
    try {
      if (this.struct.prevKey === undefined) throw new Error('this struct do not support findPrev.');

      // call by ModelFactory
      if (this.struct.pk === '' && condition.key) {
        const findModel = await this._find(condition.key);
        const res = await this._find(findModel.struct.prevKey);
        this.struct = new Structs[this.tableName](res);
        return this;
      }

      // call by model
      if (!!this.struct.pk && this.struct.prevKey) {
        const res = await this._find(this.struct.prevKey);
        const newModel = new Model({ database: this.db, struct: this.tableName });
        newModel.struct = new Structs[newModel.tableName](res);
        return newModel;
      }
      throw new Error('pk or nextKey not exist.');
    } catch (e) {
      console.trace('findNext failed.', e);
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

  async _remove(data) {
    const key = `${this.tableName}-${data.pk}`;
    const res = await this.db.del(key);
    return res;
  }

  _tableName() {
    return String(this.tableName);
  }
}

module.exports = Model;
