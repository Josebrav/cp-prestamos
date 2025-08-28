const { Cuota } = require('../database');
const dayjs = require('dayjs');

const createCuotas = async ({ prestamoId, fechaInicio, montoBase, cantidadCuotas }) => {
  if (!prestamoId || !fechaInicio || !montoBase || !cantidadCuotas) {
    throw new Error('Faltan datos obligatorios para crear las cuotas');
  }

  // NO aplicar 15% de nuevo, ya viene aplicado en montoBase
  const montoPorCuota = parseFloat(montoBase) / cantidadCuotas;

  // Buscar último número de control usado en la tabla de cuotas
  const ultimaCuota = await Cuota.findOne({
    order: [['numeroControl', 'DESC']]
  });
  let numeroControlBase = ultimaCuota ? ultimaCuota.numeroControl + 1 : 1;

  const cuotas = [];

  for (let i = 0; i < cantidadCuotas; i++) {
    // ✅ primera cuota vence 1 mes después
    const vencimiento = dayjs(fechaInicio).add(i + 1, 'month').format('YYYY-MM-DD');

    cuotas.push({
      prestamoId,
      numeroCuota: i + 1,  // ejemplo: 3/6
      fechaVencimiento: vencimiento,
      numeroControl: numeroControlBase + i,       // correlativo único por cuota
      monto: montoPorCuota.toFixed(2),
      estado: 'al dia'
    });
  }

  // Crear en base de datos
  const cuotasCreadas = await Cuota.bulkCreate(cuotas);
  return cuotasCreadas;
};

module.exports = createCuotas;
