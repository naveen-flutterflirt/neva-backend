const { Op } = require('sequelize');
const User = require('../models/user');

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findByIdentifier(identifier) {
    return await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { contactNumber: identifier }
        ]
      }
    });
  }

  async findById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }

  async createUser(userData) {
    return await User.create(userData);
  }
}

module.exports = new UserRepository();
