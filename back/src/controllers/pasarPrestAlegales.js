// controllers/pasarPrestAlegales.js
const { Prestamo } = require('../database');

const cambiarPrestamoALegales = async (req, res) => {
  try {
    const { numeroControl } = req.body;
    if (!numeroControl) return res.status(400).json({ error: "Falta numeroControl" });

    // Convertir a entero
    const numero = parseInt(numeroControl);

    // Buscar préstamo
    const prestamo = await Prestamo.findOne({ where: { numeroControl: numero } });
    if (!prestamo) return res.status(404).json({ error: "Préstamo no encontrado" });

    // Cambiar estado
    prestamo.estado = 'en legales';
    await prestamo.save();

    res.json({ message: "Prestamo pasado a legales", prestamo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar préstamo" });
  }
};

module.exports = { cambiarPrestamoALegales };
