const { Prestamo } = require("../database");

const getPrestamosByEstado = async (estado) => {
  if (!estado) {
    // Si no se pasa estado, devuelve todos los préstamos
    return await Prestamo.findAll();
  }

  // Verifica que el estado sea válido
  const estadosValidos = ['pendiente', 'finalizado', 'vencido', 'cancelado', 'al dia'];
  if (!estadosValidos.includes(estado)) {
    throw new Error(`Estado inválido: ${estado}`);
  }

  return await Prestamo.findAll({ where: { estado } });
};

module.exports = getPrestamosByEstado;
