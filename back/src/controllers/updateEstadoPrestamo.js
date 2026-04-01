const { Prestamo, Cuota } = require('../database');

const updateEstadoPrestamo = async (id, nuevoEstado) => {
  if (!id || !nuevoEstado) {
    throw new Error('Faltan parámetros');
  }

  const estadosValidos = [
    'pendiente',
    'al dia',
    'vencido',
    'cancelado',
    'finalizado',
    'en legales'
  ];

  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error('Estado inválido');
  }

  // 🔥 Traemos el préstamo con sus cuotas
  const prestamo = await Prestamo.findByPk(id, {
    include: [{ model: Cuota, as: "cuotas" }]
  });

  if (!prestamo) {
    throw new Error('Préstamo no encontrado');
  }

  // 🔴 CLAVE: si se cancela
  if (nuevoEstado === "cancelado") {
    await Promise.all(
      prestamo.cuotas.map(async (cuota) => {
        if (cuota.estado !== "pagada") {
          cuota.estado = "cancelada";
          await cuota.save();
        }
      })
    );
  }

  // actualizar estado del préstamo
  prestamo.estado = nuevoEstado;
  await prestamo.save();

  return prestamo;
};

module.exports = updateEstadoPrestamo;