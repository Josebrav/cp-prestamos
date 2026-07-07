const { User, Prestamo, Cuota } = require('../database');

const getUserBySurnameController = async (surname) => {
  return await User.findAll({
    where: { surname },
    include: [
      {
        model: Prestamo,
        as: 'Prestamos',
        include: [
          {
            model: Cuota,
            as: 'cuotas',
          }
        ],
      },
    ],
  });
};

module.exports = getUserBySurnameController;
