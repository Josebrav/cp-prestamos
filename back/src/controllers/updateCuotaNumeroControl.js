const { Cuota } = require('../database');
const { Op } = require('sequelize');

const updateCuotaNumeroControl = async (id, numeroControl) => {
  if (!id) throw new Error('Falta id de cuota');
  if (numeroControl === undefined || numeroControl === null)
    throw new Error('Falta numeroControl');

  const n = parseInt(numeroControl);
  if (!Number.isInteger(n) || n <= 0) throw new Error('numeroControl inválido');

  const cuota = await Cuota.findByPk(id);
  if (!cuota) throw new Error('Cuota no encontrada');

  // Verificar que no exista otra cuota con el mismo numeroControl
  const existente = await Cuota.findOne({
    where: {
      numeroControl: n,
      id: { [Op.ne]: id },
    },
  });

  if (existente) {
    const err = new Error('Número de control ya en uso');
    err.code = 'DUPLICATE';
    throw err;
  }

  cuota.numeroControl = n;
  await cuota.save();
  return cuota;
};

module.exports = updateCuotaNumeroControl;
