// src/controllers/updateCuotaEstado.js
const { Cuota } = require('../database');

const updateCuotaEstado = async (id, nuevoEstado) => {
  if (!id || !nuevoEstado) {
    throw new Error('Faltan parámetros requeridos');
  }

  const estadosValidos = ['al dia', 'vencida', 'pagada','cancelada'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error('Estado inválido');
  }

  const cuota = await Cuota.findByPk(id);
  if (!cuota) {
    throw new Error('Cuota no encontrada');
  }

  cuota.estado = nuevoEstado;
  await cuota.save();

  return cuota;
};

module.exports = updateCuotaEstado;
