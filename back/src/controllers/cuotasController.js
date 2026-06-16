const { Cuota, Prestamo, User, PagoCuota } = require("../database");
const { Op } = require("sequelize");

// Trae datos de una cuota
const getCuotaById = async (req, res) => {
  try {
    const { id } = req.params;
    const cuota = await Cuota.findByPk(id, {
      include: [
        { model: Prestamo, 
          include: [
            { model: User },
            { model: Cuota, as: "cuotas" }, 
      ]
    
     },
    {
      model: PagoCuota, // 👈 ESTO ES LO QUE FALTA
    }
  ]
  
  });
    if (!cuota) return res.status(404).json({ error: "Cuota no encontrada" });
    res.json(cuota);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener cuota" });
  }
};

// Registrar pago de una cuota (parcial o total)
const pagarCuota = async (req, res) => {
  try {
    const { id } = req.params;
    const { montoPagado, fechaPago, interesPagado, quitaAplicada } = req.body;

    const cuota = await Cuota.findByPk(id, { include: [Prestamo] });
    if (!cuota) return res.status(404).json({ error: "Cuota no encontrada" });
    // Validaciones básicas
    const pago = Number(montoPagado);
    if (isNaN(pago) || pago <= 0) return res.status(400).json({ error: 'Monto de pago inválido' });

    const fecha = fechaPago || new Date().toISOString().split('T')[0];

    // Registrar pago en historial siempre
    await PagoCuota.create({ cuotaId: id, monto: pago, fechaPago: fecha });

    // Monto pagado acumulado hasta ahora
    const montoPagadoPrevio = Number(cuota.montoPagado) || 0;
    const nuevoMontoPagado = Number((montoPagadoPrevio + pago).toFixed(2));

    // Determinar monto a cobrar actual (si existe montoConInteres se considera lo que queda incluyendo intereses)
    const montoConInteresActual = cuota.montoConInteres !== null && cuota.montoConInteres !== undefined
      ? Number(cuota.montoConInteres)
      : Number(cuota.monto);

    // Saldo original pendiente (sin intereses)
    const saldoPendienteOriginal = Number(cuota.monto) - montoPagadoPrevio;

    // Interés actual incluido en montoConInteres (si aplica)
    const interesActual = Math.max(0, montoConInteresActual - saldoPendienteOriginal);

    // Calcular restante después del pago
    const restanteConInteres = Number((montoConInteresActual - pago).toFixed(2));

    // Si la cuota está vencida, el pago parcial debe cubrir al menos los intereses pendientes
    const interesesPendientes = Number(interesActual.toFixed(2));
    if (cuota.estado === 'vencida' && pago < interesesPendientes && restanteConInteres > 0) {
      return res.status(400).json({ error: `Debe abonar al menos los intereses: $${interesesPendientes}` });
    }

    // Si el pago cubre o excede lo adeudado (con intereses), marcamos como pagada
    if (restanteConInteres <= 0 || quitaAplicada) {
      cuota.estado = 'pagada';
      cuota.montoConInteres = 0;
      // Registrar monto pagado acumulado (sumatoria previa + pago actual)
      cuota.montoPagado = nuevoMontoPagado; // ahora guarda el total abonado
      cuota.fechaPago = fecha;
      // interesPagado: sumamos lo que se haya pagado por intereses (no excede interesActual)
      const interesPagadoAhora = Math.min(interesActual, pago);
      cuota.interesPagado = Number(((Number(cuota.interesPagado) || 0) + interesPagadoAhora).toFixed(2));
      await cuota.save();
      return res.json({ message: 'Cuota pagada correctamente', cuota });
    }

    // Pago parcial: actualizar montos acumulados y montoConInteres restante
    cuota.montoPagado = nuevoMontoPagado;
    cuota.montoConInteres = restanteConInteres;
    // Si hay interés, actualizar interesPagado en la parte correspondiente
    const interesPagadoAhora = Math.min(interesActual, pago);
    cuota.interesPagado = Number(((Number(cuota.interesPagado) || 0) + interesPagadoAhora).toFixed(2));
    // Mantener estado: si originalmente estaba vencida, conservar vencida; si no, dejar 'al dia' o 'vencida' según monto
    if (cuota.estado === 'vencida' && restanteConInteres > 0) cuota.estado = 'vencida';
    else if (cuota.estado !== 'pagada') cuota.estado = 'al dia';

    await cuota.save();
    return res.json({ message: 'Pago parcial registrado', cuota });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar pago" });
  }
};




module.exports = { getCuotaById, pagarCuota };
