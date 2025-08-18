// src/handlers/putCuotaEstadoHandler.js
const updateCuotaEstado = require('../controllers/updateCuotaEstado');

const putCuotaEstadoHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const cuotaActualizada = await updateCuotaEstado(id, estado);
    res.status(200).json(cuotaActualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = putCuotaEstadoHandler;
