const { Cuota, Prestamo, User } = require('../database');
const { Op } = require('sequelize');

const getCuotasVencidasMes = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: "Debes enviar año y mes" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const cuotas = await Cuota.findAll({
      where: {
        fechaVencimiento: {
          [Op.between]: [startDate, endDate]
        },
        // Excluir cuotas ya pagadas y montos 0
        estado: { [Op.not]: 'pagada' },
        [Op.or]: [
          { monto: { [Op.gt]: 0 } },
          { montoConInteres: { [Op.gt]: 0 } }
        ]
      },
      include: [
        {
          model: Prestamo,
          attributes: ['numeroControl', 'estado'],
          required: true,

          // 🔥 ACA ESTA LA CLAVE
          where: {
            estado: "al dia"
          },

          include: [
            {
              model: User,
              attributes: ['name', 'surname']
            }
          ]
        }
      ],
      order: [['fechaVencimiento', 'ASC']]
    });

    const resultado = cuotas.map(c => ({
      id: c.id,
      cliente: `${c.Prestamo.User.name} ${c.Prestamo.User.surname}`,
      numeroControl: c.Prestamo.numeroControl,
      monto: c.montoConInteres || c.monto,
      fechaVencimiento: c.fechaVencimiento,
      estadoPrestamo: c.Prestamo.estado // opcional
    }));

    return res.status(200).json(resultado);

  } catch (err) {
    console.error("Error en getCuotasVencidasMes:", err);
    return res.status(500).json({ error: "Error al obtener cuotas" });
  }
};

module.exports = { getCuotasVencidasMes };