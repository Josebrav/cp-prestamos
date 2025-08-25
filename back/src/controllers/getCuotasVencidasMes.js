const { Cuota, Prestamo, User } = require('../database');
const { Op } = require('sequelize');

const getCuotasVencidasMes = async (req, res) => {
  try {
    const { year, month } = req.query;
    console.log(year, month);
    

    if (!year || !month) {
      return res.status(400).json({ error: "Debes enviar año y mes" });
    }

    // Convertir a Number
   const startDate = new Date(year, month - 1, 1); // primer día del mes
  const endDate = new Date(year, month, 0);       // último día del mes

    const cuotas = await Cuota.findAll({
  where: {
    fechaVencimiento: {
      [Op.between]: [startDate, endDate]
    },
   
  },
  include: [
    {
      model: Prestamo,
      attributes: ['numeroControl'],
      required: true, // Esto fuerza que solo traiga cuotas con préstamo
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
      fechaVencimiento: c.fechaVencimiento
    }));
    console.log(resultado, cuotas);
    

    return res.status(200).json(resultado);
  } catch (err) {
    console.error("Error en getCuotasVencidasMes:", err);
    return res.status(500).json({ error: "Error al obtener cuotas vencidas" });
  }
};

module.exports = { getCuotasVencidasMes };
