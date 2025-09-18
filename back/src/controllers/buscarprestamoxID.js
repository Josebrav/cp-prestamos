// src/controllers/prestamoController.js
const { Prestamo, Cuota, User } = require('../database'); // ajustá si tu índice exporta distinto




async function deletePrestamoByNumeroControl(req, res) {
  try {
    const { numeroControl } = req.params;
    const n = Number(numeroControl);

    if (!Number.isInteger(n)) {
      return res.status(400).json({ error: 'numeroControl debe ser un entero' });
    }

    const prestamo = await Prestamo.findOne({ where: { numeroControl: n } });
    if (!prestamo) {
      return res.status(404).json({ error: 'No se encontró préstamo con ese número de control' });
    }

    await prestamo.destroy();
    return res.json({ ok: true, message: `Préstamo ${n} eliminado` });
  } catch (err) {
    console.error('Error en deletePrestamoByNumeroControl:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {

  deletePrestamoByNumeroControl, 
};
