// controllers/getTotalAcumulado.js
const { Prestamo, Cuota, User } = require('../database');
const { Op } = require('sequelize');

const getTotalAcumulado = async (req, res) => {
  try {
    const hoy = new Date();

    const cuotasVencidas = await Cuota.findAll({
      where: {
        fechaVencimiento: { [Op.lt]: hoy },
        estado: { [Op.not]: 'pagada' }
      },
      include: [
        { model: Prestamo, include: [{ model: User, attributes: ['name', 'surname'] }] }
      ]
    });

    // Agrupar por préstamo
    const prestamosMap = {};
    cuotasVencidas.forEach(c => {
      const pId = c.prestamoId;
      if (!prestamosMap[pId]) {
        prestamosMap[pId] = {
          numeroControl: c.Prestamo.numeroControl,
          estado: c.Prestamo.estado,
          cuotasRestantes: 0,
          montoRestante: 0,
          cliente: `${c.Prestamo.User?.name || ''} ${c.Prestamo.User?.surname || ''}`.trim()
        };
      }
      prestamosMap[pId].cuotasRestantes += 1;
      prestamosMap[pId].montoRestante += Number(c.monto || 0);
    });

    res.json(Object.values(prestamosMap));
  } catch (error) {
    console.error('Error generando total acumulado:', error);
    res.status(500).json({ error: 'Error generando total acumulado' });
  }
};

module.exports = { getTotalAcumulado };
