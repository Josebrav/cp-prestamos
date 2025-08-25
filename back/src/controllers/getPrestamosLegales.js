const { Prestamo, User, Cuota } = require('../database');

const getPrestamosEnLegales = async () => {
  // Filtramos solo préstamos en estado "en legales"
  const prestamos = await Prestamo.findAll({
    where: { estado: 'en legales' },
    include: [
      {
        model: User,
        attributes: ["id", "name", "surname", "dni"]
      },
      {
        model: Cuota,
        as: "cuotas",
        attributes: ["id", "numeroCuota", "monto", "montoConInteres", "estado"]
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

module.exports = getPrestamosEnLegales;
