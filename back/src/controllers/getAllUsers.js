const { User, Prestamo } = require('../database');

const getAllUsers = async () => {
  const users = await User.findAll({
    include: [
      {
        model: Prestamo,
        attributes: ['id', 'estado', 'monto', 'fechaInicio'] // 👈 importante
      }
    ],
    raw: false,   // 👈 CLAVE
    nest: true    // 👈 CLAVE
  });

  return users;
};

module.exports = getAllUsers;