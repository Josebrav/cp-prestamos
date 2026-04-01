const { Cuota } = require('../database');
const dayjs = require('dayjs');

const createCuotas = async ({ prestamoId, fechaInicio, montoBase, cantidadCuotas }) => {
  if (!prestamoId || !fechaInicio || !montoBase || !cantidadCuotas) {
    throw new Error('Faltan datos obligatorios para crear las cuotas');
  }
console.log("📅 fechaInicio raw:", fechaInicio);
console.log("📅 dayjs(fechaInicio):", dayjs(fechaInicio).format());
console.log("📅 dayjs UTC:", dayjs(fechaInicio).toISOString());
  // NO aplicar 15% de nuevo, ya viene aplicado en montoBase
  const montoPorCuota = parseFloat(montoBase) / cantidadCuotas;

  // Buscar último número de control usado en la tabla de cuotas
  const ultimaCuota = await Cuota.findOne({
    order: [['numeroControl', 'DESC']]
  });

  // Si no hay cuotas, arrancamos en 1
  let numeroControlBase = ultimaCuota ? ultimaCuota.numeroControl + 1 : 1;

  const cuotas = [];

  for (let i = 0; i < cantidadCuotas; i++) {
    // ✅ primera cuota vence 1 mes después
 const fechaBase = dayjs(fechaInicio);
const diaOriginal = fechaBase.date();

const fechaTemp = fechaBase.add(i + 1, 'month');

// último día del mes
const ultimoDiaMes = fechaTemp.daysInMonth();

// usar el menor entre el día original y el máximo posible
const diaFinal = Math.min(diaOriginal, ultimoDiaMes);

const vencimiento = fechaTemp
  .date(diaFinal)
  .format('YYYY-MM-DD');

    cuotas.push({
      prestamoId,
      numeroCuota: i + 1, // ej: "3/6"
      fechaVencimiento: vencimiento,
      numeroControl: numeroControlBase + i, // correlativo único global
      monto: montoPorCuota.toFixed(2),
      estado: 'al dia'
    });
    console.log("➡️ Iteración:", i);
console.log("fechaTemp:", fechaTemp.format());
console.log("diaOriginal:", diaOriginal);
console.log("ultimoDiaMes:", ultimoDiaMes);
console.log("diaFinal:", diaFinal);
console.log("vencimiento FINAL:", vencimiento);
  }

  // Crear en base de datos
  const cuotasCreadas = await Cuota.bulkCreate(cuotas);
  return cuotasCreadas;
};

module.exports = createCuotas;
