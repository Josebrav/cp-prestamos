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

  // Buscar tasa configurada
  const config = await TasaConfig.findByPk(tipoTasa);
  if (!config) {
    throw new Error("Tipo de tasa no configurado");
  }

  const tasaAnual = parseFloat(config.tasaAnual);

  // ✅ Nuevo cálculo: interés proporcional según días de cuotas
  const interesCalculado = (tasaAnual / 365) * (cuotas * 21.01); // % total
  const montoFinalCalculado = parseFloat(monto) * (1 + interesCalculado / 100);

  // 🔹 Calcular numeroControl (incremental por usuario)
  const ultimoPrestamo = await Prestamo.findOne({
    where: { userId },
    order: [['numeroControl', 'DESC']],
  });
  const numeroControl = ultimoPrestamo ? ultimoPrestamo.numeroControl + 1 : 1;

  // Crear el préstamo
  const newPrestamo = await Prestamo.create({
    userId,
    numeroControl,
    fechaInicio,
    monto,
    tipoTasa,
    tasaMoraAnual: tasaAnual,
    cuotas,
    montoFinal: montoFinalCalculado.toFixed(2),
    estado: estado || 'pendiente',
  });

  // Crear cuotas con monto dividido en partes iguales
  await createCuotas({
    prestamoId: newPrestamo.id,
    fechaInicio,
    montoBase: montoFinalCalculado,
    cantidadCuotas: cuotas,
  });

  return newPrestamo;
};

module.exports = postPrestamo;