// controllers/getTotalAcumulado.js
const { Prestamo, Cuota, User } = require('../database');

const getTotalAcumulado = async (req, res) => {
  try {
    const prestamos = await Prestamo.findAll({
      include: [
        {
          model: User,
          attributes: ['name', 'surname'],
        },
        {
          model: Cuota,
          as: 'cuotas',
          attributes: ['id', 'numeroCuota', 'monto', 'montoConInteres', 'estado'],
        },
      ],
      order: [['numeroControl', 'ASC']],
    });

    const reportData = prestamos
      .map((prestamo) => {
        // Considerar sólo cuotas vencidas (no incluir 'al dia')
        const cuotasPendientes = (prestamo.cuotas || []).filter(
          (cuota) => (cuota.estado || '').toString().toLowerCase() === 'vencida'
        );

        if (cuotasPendientes.length === 0) {
          return null;
        }

        const montoPendiente = cuotasPendientes.reduce(
          (acc, cuota) => acc + Number(cuota.montoConInteres ?? cuota.monto ?? 0),
          0
        );

        const intereses = cuotasPendientes.reduce(
          (acc, cuota) => {
            const montoBase = Number(cuota.monto ?? 0);
            const montoConInteres = Number(cuota.montoConInteres ?? cuota.monto ?? 0);
            return acc + Math.max(0, montoConInteres - montoBase);
          },
          0
        );

        return {
          numeroControl: prestamo.numeroControl,
          estado: prestamo.estado,
          cuotasRestantes: cuotasPendientes.length,
          montoPendiente: Number(montoPendiente.toFixed(2)),
          montoRestante: Number(montoPendiente.toFixed(2)),
          montoFinal: Number(prestamo.montoFinal ?? 0),
          intereses: Number(intereses.toFixed(2)),
          cliente: `${prestamo.User?.name || ''} ${prestamo.User?.surname || ''}`.trim(),
        };
      })
      .filter(Boolean);

    res.json(reportData);
  } catch (error) {
    console.error('Error generando total acumulado:', error);
    res.status(500).json({ error: 'Error generando total acumulado' });
  }
};

module.exports = { getTotalAcumulado };
