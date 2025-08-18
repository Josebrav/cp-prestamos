const { Prestamo, TasaConfig } = require('../database');
const createCuotas = require('./createCuota');

const postPrestamo = async (prestamoData) => {
  const {
    userId,
    fechaInicio,
    monto,
    tipoTasa,
    cuotas, // cantidad de cuotas
    estado,
  } = prestamoData;

  if (!userId || !fechaInicio || !monto || !tipoTasa || !cuotas) {
    throw new Error("Faltan campos obligatorios");
  }

  const config = await TasaConfig.findByPk(tipoTasa);
  if (!config) {
    throw new Error("Tipo de tasa no configurado");
  }

  const tasaMoraAnual = config.tasaAnual;

  // Calcular monto final: monto + 15% * numero de cuotas
  const porcentajeExtra = 0.15 * cuotas; // 15% por cuota
  const montoFinalCalculado = parseFloat(monto) * (1 + porcentajeExtra);

  // 🔹 Calcular numeroControl (incremental por usuario)
  const ultimoPrestamo = await Prestamo.findOne({
    where: { userId },
    order: [['numeroControl', 'DESC']],
  });
  const numeroControl = ultimoPrestamo ? ultimoPrestamo.numeroControl + 1 : 1;

  // Crear el préstamo con montoFinal y numeroControl
  const newPrestamo = await Prestamo.create({
    userId,
    numeroControl,           // <-- asignado
    fechaInicio,
    monto,
    tipoTasa,
    tasaMoraAnual,
    cuotas,
    montoFinal: montoFinalCalculado.toFixed(2),
    estado: estado || 'pendiente',
  });

  // Crear cuotas con monto dividido en partes iguales según montoFinal calculado
  await createCuotas({
    prestamoId: newPrestamo.id,
    fechaInicio,
    montoBase: montoFinalCalculado,
    cantidadCuotas: cuotas
  });

  return newPrestamo;
};

module.exports = postPrestamo;
