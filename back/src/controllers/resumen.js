const { Prestamo, Cuota, User } = require('../database');
const { Op } = require('sequelize');

const getResumenSGP = async (req, res) => {
  try {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // 1. Préstamos entregados en este mes
    const prestamosMes = await Prestamo.findAll({
      where: {
        fechaInicio: {
          [Op.between]: [primerDiaMes, ultimoDiaMes],
        },
      },
      include: [{ model: Cuota, as: 'cuotas' }],
    });

    const cantidadPrestamos = prestamosMes.length;
    const dineroEntregado = prestamosMes.reduce((acc, p) => acc + Number(p.monto), 0);
    const dineroACobrar = prestamosMes.reduce((acc, p) => acc + Number(p.montoFinal || 0), 0);

    // 2. Total a cobrar del mes actual (cuotas que vencen este mes)
    const cuotasMes = await Cuota.findAll({
      where: {
        fechaVencimiento: {
          [Op.between]: [primerDiaMes, ultimoDiaMes],
        },
        estado: { [Op.not]: 'pagada' }
      },
      include: [Prestamo],
    });
    const totalCobrarMes = cuotasMes.reduce((acc, c) => acc + Number(c.monto || 0), 0);
    const prestamosCobroMes = [...new Set(cuotasMes.map(c => c.prestamoId))].length;

    // 3. Total a cobrar acumulado (cuotas vencidas hasta fin de mes)
    // Considerar solo cuotas efectivamente vencidas (estado === 'vencida')
    const cuotasAcumuladas = await Cuota.findAll({
      where: {
        fechaVencimiento: { [Op.lte]: ultimoDiaMes },
        estado: 'vencida'
      },
      include: [Prestamo],
    });
    // Sumar montoConInteres cuando exista, sino monto
    const totalAcumuladoMonto = cuotasAcumuladas.reduce((acc, c) => acc + Number(c.montoConInteres ?? c.monto ?? 0), 0);
    const totalAcumuladoPrestamos = [...new Set(cuotasAcumuladas.map(c => c.prestamoId))].length;

    // 4. Restante a cobrar a futuro (cuotas desde mañana en adelante)
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    const cuotasFuturo = await Cuota.findAll({
      where: {
        fechaVencimiento: { [Op.gte]: mañana },
        estado: { [Op.not]: 'pagada' }
      },
      include: [
        { model: Prestamo, include: [{ model: User, attributes: ['name', 'surname'] }] }
      ],
    });
    const totalFuturoMonto = cuotasFuturo.reduce((acc, c) => {
      // Si existe montoConInteres se interpreta como el monto restante (pagar con intereses)
      const montoConInteresVal = c.montoConInteres !== null && c.montoConInteres !== undefined
        ? Number(c.montoConInteres)
        : null;
      const montoPagadoVal = c.montoPagado !== null && c.montoPagado !== undefined ? Number(c.montoPagado) : 0;
      const montoOriginal = Number(c.monto || 0);

      const restante = montoConInteresVal !== null
        ? montoConInteresVal
        : Math.max(0, montoOriginal - montoPagadoVal);

      return acc + restante;
    }, 0);
    const totalFuturoPrestamos = [...new Set(cuotasFuturo.map(c => c.prestamoId))].length;

    // Respuesta final
    res.json({
      prestamosMes: {
        cantidad: cantidadPrestamos,
        dineroEntregado,
        dineroACobrar,
      },
      totalCobrarMes: {
        monto: totalCobrarMes,
        prestamos: prestamosCobroMes,
      },
      totalAcumulado: {
        monto: totalAcumuladoMonto,
        prestamos: totalAcumuladoPrestamos,
      },
      restanteFuturo: {
        monto: totalFuturoMonto,
        prestamos: totalFuturoPrestamos,
      },
    });
  } catch (error) {
    console.error('Error generando resumen SGP:', error);
    res.status(500).json({ error: 'Error generando resumen SGP' });
  }
};

module.exports = { getResumenSGP };
