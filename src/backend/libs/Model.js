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
      throw new Error('Should include key.');
    } catch (e) {
      console.trace('Save failed.', e);
      throw e;
    }
  }

  async _save(data) {
    const key = `${this.tableName}-${data.key}`;
    const res = await this.db.put(key, data);
    return res;
  }

  async find({ condition }) {
    try {
      if (!condition) {
        return Promise.reject(new Error('Condition should not be null.'));
      }
      const res = await this._find(condition);
      this.struct = new Structs[this.tableName](res);
      return this;
    } catch (e) {
      console.trace('Find failed.', e);
      throw e;
    }
  }

  async _find(condition) {
    const key = `${this.tableName}-${condition}`;
    const res = await this.db.get(key);
    console.log('_find res', res);
    res.key = res.key.replace(`${this.tableName}-`);
    return res;
  }

  async update({ condition, data }) {
    try {
      const findRes = await this._find(condition);
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

  async findNext({ condition }) {
    try {
      if (this.struct.nextKey === undefined) throw new Error('this struct do not support findNext.');

      // call by ModelFactory
      if (this.struct.key === '' && condition) {
        const findModel = await this._find(condition);
        const res = await this._find(findModel.struct.nextKey);
        this.struct = new Structs[this.tableName](res);
        return this;
      }

      // call by model
      if (!!this.struct.key && this.struct.nextKey) {
        const res = await this._find(this.struct.nextKey);
        const newModel = new Model({ database: this.db, struct: this.tableName });
        newModel.struct = new Structs[newModel.tableName](res);
        return newModel;
      }
      throw new Error('condition or nextKey not exist.');
    } catch (e) {
      console.trace('findNext failed.', e);
      throw e;
    }
  }

  async findPrev({ condition }) {
    try {
      if (this.struct.prevKey === undefined) throw new Error('this struct do not support findPrev.');

      // call by ModelFactory
      if (this.struct.key === '' && condition) {
        const findModel = await this._find(condition);
        const res = await this._find(findModel.struct.prevKey);
        this.struct = new Structs[this.tableName](res);
        return this;
      }

      // call by model
      if (!!this.struct.key && this.struct.prevKey) {
        const res = await this._find(this.struct.prevKey);
        const newModel = new Model({ database: this.db, struct: this.tableName });
        newModel.struct = new Structs[newModel.tableName](res);
        return newModel;
      }
      throw new Error('condition or nextKey not exist.');
    } catch (e) {
      console.trace('findNext failed.', e);
      throw e;
    }
  }

  _tableName() {
    return String(this.tableName);
  }
}

module.exports = Model;
