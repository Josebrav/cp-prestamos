const { User, Prestamo, Cuota } = require('../database');

const getUserByDniController = async (dni) => {
  return await User.findOne({
    where: { dni },
    include: [
      {
        model: Prestamo,
        as: 'Prestamos',   // Asegúrate que en User.js la asociación es User.hasMany(Prestamo, { as: 'Prestamos' })
        include: [
          {
            model: Cuota,
            as: 'cuotas',   // Esto coincide con Prestamo.hasMany(Cuota, { as: 'cuotas' })
          }
        ],
      },
    ],
  });
};

module.exports = getUserByDniController;
