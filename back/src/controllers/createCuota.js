const { Cuota } = require('../database');
const dayjs = require('dayjs');

const createCuotas = async ({ prestamoId, fechaInicio, montoBase, cantidadCuotas }) => {
  if (!prestamoId || !fechaInicio || !montoBase || !cantidadCuotas) {
    throw new Error('Faltan datos obligatorios para crear las cuotas');
  }

  // NO aplicar 15% de nuevo, ya viene aplicado en montoBase
  const montoPorCuota = parseFloat(montoBase) / cantidadCuotas;

  const cuotas = [];

  for (let i = 0; i < cantidadCuotas; i++) {
    // ✅ primera cuota vence 1 mes después
    const vencimiento = dayjs(fechaInicio).add(i + 1, 'month').format('YYYY-MM-DD');

    cuotas.push({
      prestamoId,
      numeroCuota: i + 1,
      fechaVencimiento: vencimiento,
      monto: montoPorCuota.toFixed(2),
      estado: 'al dia'
    });
  }

  // Crear en base de datos
  const cuotasCreadas = await Cuota.bulkCreate(cuotas);
  return cuotasCreadas;
};

module.exports = createCuotas;
