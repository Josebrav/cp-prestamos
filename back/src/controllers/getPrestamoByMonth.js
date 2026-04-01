const { Prestamo, User, Cuota } = require('../database');
const { Op } = require('sequelize');

const getPrestamosByMonth = async (year, month, soloACobrar = false) => {
  // Calculamos rango de fechas
  const startDate = new Date(year, month - 1, 1); // primer día del mes
  const endDate = new Date(year, month, 0);       // último día del mes

  // Definimos el objeto where
  const where = {
    fechaInicio: {
      [Op.between]: [startDate, endDate]
    }
  };

  // Si solo queremos los préstamos a cobrar
  if (soloACobrar) {
    where.estado = { [Op.in]: ['vencido', 'en legales'] };
  }

  // Traemos préstamos con usuario y cuotas
  const prestamos = await Prestamo.findAll({
    where,
    include: [
      {
        model: User,
        attributes: ["id", "name", "surname", "dni"]
      },
      {
  model: Cuota,
  as: "cuotas",
  attributes: ["id", "numeroCuota", "monto", "montoConInteres", "estado"],
 //nclude: [
   //
     //odel: PagoCuota // 👈 ESTO FALTABA
   //}
 //]
}
    ],
    order: [["fechaInicio", "ASC"]]
  });

  // Calculamos resumen de cuotas por cada préstamo
  const prestamosConResumen = prestamos.map(p => {
    const total = p.cuotas.length;
    const pagadas = p.cuotas.filter(c => c.estado === "pagada").length;
    const vencidas = p.cuotas.filter(c => c.estado === "vencida").length;
    const montoAdeudado = p.cuotas
      .filter(c => c.estado !== "pagada")
      .reduce((acc, c) => acc + Number(c.montoConInteres || c.monto || 0), 0);

    return {
      id: p.id,
      numeroControl: p.numeroControl,
      fechaInicio: p.fechaInicio,
      monto: p.monto,
      estado: p.estado,
      User: p.User,
      cuotas: p.cuotas,
      resumenCuotas: {
        total,
        pagadas,
        vencidas,
        montoAdeudado
      }
    };
  });

  return prestamosConResumen;
};

module.exports = { getPrestamosByMonth };
