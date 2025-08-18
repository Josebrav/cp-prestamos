const { Prestamo, User, Cuota } = require('../database');

const getPrestamo = async (id) => {
  const prestamo = await Prestamo.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'surname', 'dni'],
      },
      {
        model: Cuota,
        as: 'cuotas',
      }
    ]
  });

  if (!prestamo) {
    throw new Error('Préstamo no encontrado');
  }

  // Devolvemos el préstamo con cuotas sin hacer cálculos ni sumar montos
  return prestamo.toJSON();
};

module.exports = getPrestamo;
