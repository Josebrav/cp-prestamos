const { Prestamo, Cuota } = require('../database');
const { Op } = require('sequelize');
const dayjs = require('dayjs');



const calcularInteres = (prestamo, { graceDays = 0 } = {}) => {
  const hoy = dayjs().startOf("day");
  let interesTotal = 0;

  if (!prestamo.cuotas || !Array.isArray(prestamo.cuotas)) {
    return 0;
  }

  for (const cuota of prestamo.cuotas) {
    const montoOriginal = parseFloat(cuota.monto) || 0;
    const montoPagado = parseFloat(cuota.montoPagado) || 0;
    let saldoPendiente = montoOriginal - montoPagado;

    // 🔹 Si la cuota ya está pagada o saldo = 0, no genera deuda
    if (cuota.estado === "pagada" || saldoPendiente <= 0) {
      cuota.montoConInteres = 0;
      cuota.estado = "pagada";
      continue;
    }

    // 🔹 Si todavía no venció o está en período de gracia
    const vencimiento = dayjs(cuota.fechaVencimiento).startOf("day");
    let diasDesdeVencimiento = hoy.diff(vencimiento, "day");
    if (diasDesdeVencimiento <= graceDays) {
      cuota.montoConInteres = saldoPendiente;
      continue;
    }

    // 🔹 Calcular intereses sobre el saldo pendiente
    const tasaAnual = parseFloat(prestamo.tasaMoraAnual);
    if (isNaN(tasaAnual)) {
      cuota.montoConInteres = saldoPendiente;
      continue;
    }

    const dias = diasDesdeVencimiento - graceDays;
    const tasaDiaria = tasaAnual / 100 / 365;
    const interes = saldoPendiente * tasaDiaria * dias;

    interesTotal += interes;
    cuota.montoConInteres = Number((saldoPendiente + interes).toFixed(2));

    // 🔹 Marcar como vencida si pasó la fecha y no está pagada
    if (saldoPendiente > 0 && diasDesdeVencimiento > 0) {
      cuota.estado = "vencida";
    }
  }

  return Number(interesTotal.toFixed(2));
};

module.exports = { calcularInteres };


const actualizarPrestamosVencidos = async () => {
  const hoy = dayjs().startOf('day');

  const prestamos = await Prestamo.findAll({
    where: {
      estado: {
        [Op.in]: ['pendiente', 'al dia', 'vencido', 'cancelado', 'finalizado', 'en legales'],
      },
    },
    include: [
      {
        model: Cuota,
        as: 'cuotas',
        required: false,
      },
    ],
  });

  for (const prestamo of prestamos) {
    let tieneVencidas = false;

    for (const cuota of prestamo.cuotas) {
      // Manejo según estado del préstamo
      if (prestamo.estado === 'cancelado') {
        cuota.estado = cuota.estado === 'pagada' ? 'pagada' : 'vencida';
      } else if (prestamo.estado === 'pendiente') {
        cuota.estado = 'al dia';
      } else if (prestamo.estado === 'finalizado') {
        cuota.estado = 'pagada';
      } else if (prestamo.estado === 'en legales') {
        cuota.estado = 'vencida';
      } else if (prestamo.estado === 'al dia' || prestamo.estado === 'vencido') {
        // Solo actualizar cuotas vencidas
        if (dayjs(cuota.fechaVencimiento).isBefore(hoy) && cuota.estado !== 'pagada') {
          cuota.estado = 'vencida';
          tieneVencidas = true;
        } else if (cuota.estado !== 'pagada') {
          cuota.estado = 'al dia';
        }
      }
      await cuota.save();
    }

    // Calcular intereses si corresponde
    if (prestamo.estado === 'al dia' || prestamo.estado === 'vencido') {
      if (tieneVencidas) {
        calcularInteres(prestamo);
        for (const cuota of prestamo.cuotas) {
          await cuota.save();
        }
      }

      // Actualizar montoFinal sumando cuotas con interés
     /*  const sumaMontosConInteres = prestamo.cuotas.reduce(
        (acc, c) => acc + parseFloat(c.montoConInteres || c.monto || 0),
        0
      );
      prestamo.montoFinal = parseFloat(sumaMontosConInteres.toFixed(2)); */

      // Si todas las cuotas están pagadas, marcar préstamo como finalizado
      if (prestamo.cuotas.every((c) => c.estado === 'pagada')) {
        prestamo.estado = 'finalizado';
      } else if (tieneVencidas) {
        prestamo.estado = 'vencido';
      } else {
        prestamo.estado = 'al dia';
      }
    }

    await prestamo.save();
  }

  return prestamos.length;
};


module.exports = {
  actualizarPrestamosVencidos,
  calcularInteres,
};
