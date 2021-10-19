/* eslint-disable no-unused-vars */
// const Utils = require('./Utils');
const Model = require('./Model');

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

  static async findNext({ database, struct, condition }) {
    const { leveldb } = database;
    const model = await new Model({ database: leveldb, struct });
    return model.findNext({ condition });
  }

  static async findPrev({ database, struct, condition }) {
    const { leveldb } = database;
    const model = await new Model({ database: leveldb, struct });
    return model.findNext({ condition });
  }

  static async findPrefix({
    database, struct, condition,
  }) {
    const { leveldb } = database;
    const model = await new Model({ database: leveldb, struct });
    return model.findPrefix({ condition });
  }
}

module.exports = ModelFactory;
