const { Prestamo, TasaConfig } = require('../database');
const createCuotas = require('./createCuota');

const postPrestamo = async (prestamoData) => {
  const {
    userId,
    fechaInicio,
    monto,
    tipoTasa,
    cuotas, 
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
  console.log("1", tasaAnual, monto, tipoTasa,config.tasaAnual,cuotas);
  


  const tasaMes = ((tasaAnual / 100) / 12 ) ;
  const aux = Math.pow((1 + tasaMes),-cuotas);
  const ani = ((1 - aux)/tasaMes)

  const vCuota = (monto/ani)
  const montoFinalCalculado = vCuota * cuotas;

  // 🔹 Calcular numeroControl (incremental por usuario)
  
   const ultimoPrestamo = await Prestamo.findOne({
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