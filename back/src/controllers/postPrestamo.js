// services/postPrestamo.js
const { Prestamo, TasaConfig, Cuota } = require('../database');

// ============================
// Funciones auxiliares
// ============================

// Conversión anual→mensual "legacy": r = TNA * (diasPromMes / 365)
// Ej.: TNA=249 => r ≈ 0.2080027 con diasPromMes=30.49
function getMonthlyRateFromAnnual_TNA_legacy(tnaPercent, diasPromMes = 30.49) {
  const tna = Number(tnaPercent) / 100; // pasa de % a proporción
  if (!isFinite(tna)) throw new Error("tnaPercent inválido");
  return tna * (Number(diasPromMes) / 365);
}

// PMT (sistema francés) => cuota fija
function pmt(P, r, n) {
  if (r === 0) return P / n;
  return (P * r) / (1 - Math.pow(1 + r, -n));
}

// Avanza la fecha un mes manteniendo día cuando se pueda
function addOneMonth(d) {
  const dt = new Date(d);
  const day = dt.getDate();
  dt.setMonth(dt.getMonth() + 1);
  // Ajuste si el mes nuevo tiene menos días
  if (dt.getDate() < day) {
    dt.setDate(0); // último día del mes anterior al "overflow"
  }
  return dt;
}

// Crea cuotas en sistema francés
async function crearPlanFrances({ prestamoId, fechaInicio, monto, rMensual, n }) {
  const cuotas = [];
  const P = Number(monto);
  const r = Number(rMensual);
  const N = Number(n);

  const cuotaFija = (P * r) / (1 - Math.pow(1 + r, -N));

  let saldo = P;
  let fechaVto = new Date(fechaInicio);

  for (let k = 1; k <= N; k++) {
    const interes = saldo * r;
    const amortizacion = cuotaFija - interes;
    const nuevoSaldo = Math.max(0, saldo - amortizacion);

    const cuotaK = Number(cuotaFija.toFixed(2));
    const interesK = Number(interes.toFixed(2));
    const amortK = Number(amortizacion.toFixed(2));
    const saldoK = Number(nuevoSaldo.toFixed(2));

    cuotas.push({
      prestamoId,
      numero: k,
      fechaVencimiento: new Date(fechaVto),
      montoCuota: cuotaK,
      interes: interesK,
      amortizacion: amortK,
      saldo: saldoK,
      estado: 'pendiente',
    });

    saldo = nuevoSaldo;
    fechaVto = addOneMonth(fechaVto);
  }

  await Cuota.bulkCreate(cuotas);
  return { cuotaFija: Number(cuotaFija.toFixed(2)) };
}

// ============================
// Servicio principal
// ============================

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

  // Conversión "legacy": TNA * (30.49 / 365)
  const diasPromMes = config.diasPromMes ? Number(config.diasPromMes) : 30.49;
  const rMensual = getMonthlyRateFromAnnual_TNA_legacy(tasaAnual, diasPromMes);

  // Sistema francés
  const P = Number(monto);
  const N = Number(cuotas);
  const cuotaFija = pmt(P, rMensual, N);
  const montoFinalCalculado = cuotaFija * N;

  // Numero de control incremental
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
    monto: P,
    tipoTasa,
    tasaMoraAnual: tasaAnual,
    cuotas: N,
    montoFinal: Number(montoFinalCalculado.toFixed(2)),
    estado: estado || 'pendiente',
    // Trazabilidad
    tasaMensualAplicada: Number((rMensual * 100).toFixed(6)),
    metodoTasa: `TNA * (${diasPromMes}/365)`,
  });

  // Crear plan francés
  await crearPlanFrances({
    prestamoId: newPrestamo.id,
    fechaInicio: new Date(fechaInicio),
    monto: P,
    rMensual,
    n: N,
  });

  return newPrestamo;
};

module.exports = postPrestamo;
