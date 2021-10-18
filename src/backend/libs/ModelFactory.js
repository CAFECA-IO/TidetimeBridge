/* eslint-disable no-unused-vars */
// const Utils = require('./Utils');
const Model = require('./Model');

class ModelFactory {
  static async create({ database, struct }) {
    return new Model({ database, struct });
  }

  static async find({ database, struct, condition }) {
    const model = await new Model({ database, struct });
    return model.find({ condition });
  }

  static async update({
    database, struct, condition, data,
  }) {
    const model = await new Model({ database, struct });
    return model.update({ condition, data });
  }

  static async save(model) {
    return model.save();
  }
}

module.exports = ModelFactory;
