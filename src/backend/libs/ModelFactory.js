/* eslint-disable no-unused-vars */
// const Utils = require('./Utils');
const Model = require('./Model');
const Structs = require('../structs');

class ModelFactory {
  static async create({ database, struct }) {
    const { leveldb } = database;

    return new Model({ database: leveldb, struct });
  }

  static async find({ database, struct, condition }) {
    const { leveldb } = database;
    const model = await new Model({ database: leveldb, struct });
    return model.find({ condition });
  }

  static async update({
    database, struct, condition, data,
  }) {
    const { leveldb } = database;
    const model = await new Model({ database: leveldb, struct });
    return model.update({ condition, data });
  }

  static async save(model) {
    return model.save();
  }

  static async findPrefix({
    database, struct, condition,
  }) {
    const { leveldb } = database;
    const model = await new Model({ database: leveldb, struct });
    return model.findPrefix({ condition });
  }

  static async remove({ database, struct, condition }) {
    const { leveldb } = database;
    const model = await new Model({ database: leveldb, struct });
    return model.remove({ condition });
  }

  static getStructClass(struct) {
    const StructClass = Structs[struct];
    if (!StructClass) {
      return Promise.reject(new Error(`Struct '${struct}' is not support.`));
    }
    return StructClass;
  }
}

module.exports = ModelFactory;
