const { User, Prestamo } = require('../database');

const getAllUsers = async () => {
  const users = await User.findAll({
    include: [
      {
        model: Prestamo
      }
    ]
  });
  return users;
};

module.exports = getAllUsers;
