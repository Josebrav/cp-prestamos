// src/handlers/putEstadoPrestamoHandler.js
const updateEstadoPrestamo = require('../controllers/updateEstadoPrestamo');

const putEstadoPrestamoHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const prestamoActualizado = await updateEstadoPrestamo(id, estado);
    res.status(200).json(prestamoActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = putEstadoPrestamoHandler;
