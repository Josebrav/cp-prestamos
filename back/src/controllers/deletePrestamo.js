// src/controllers/deletePrestamo.js
const { Prestamo, Cuota } = require('../database');

const deletePrestamo = async (id) => {
  if (!id) throw new Error('ID de préstamo requerido');

  const prestamo = await Prestamo.findByPk(id);
  if (!prestamo) throw new Error('Préstamo no encontrado');

  // Eliminar cuotas asociadas
  await Cuota.destroy({ where: { prestamoId: id } });

  // Eliminar préstamo
  await Prestamo.destroy({ where: { id } });

  return { message: 'Préstamo eliminado correctamente' };
};

module.exports = deletePrestamo;
