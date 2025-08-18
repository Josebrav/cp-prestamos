// src/controllers/updateEstadoPrestamo.js
const { Prestamo } = require('../database');

const updateEstadoPrestamo = async (id, nuevoEstado) => {
  if (!id || !nuevoEstado) {
    throw new Error('Faltan parámetros');
  }

  const estadosValidos = ['pendiente', 'al dia', 'vencido', 'cancelado', 'finalizado', 'en legales'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error('Estado inválido');
  }

  const prestamo = await Prestamo.findByPk(id);
  if (!prestamo) {
    throw new Error('Préstamo no encontrado');
  }

  prestamo.estado = nuevoEstado;
  await prestamo.save();

  return prestamo;
};

module.exports = updateEstadoPrestamo;
