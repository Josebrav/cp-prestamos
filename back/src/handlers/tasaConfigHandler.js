// src/handlers/tasaConfigHandlers.js
const { getTasas, updateTasa } = require('../controllers/tasaConfigController');

const getTasasHandler = async (req, res) => {
  try {
    const tasas = await getTasas();
    res.status(200).json(tasas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTasaHandler = async (req, res) => {
  const { tipo } = req.params;
  const { tasaAnual } = req.body;

  try {
    const updated = await updateTasa(tipo, tasaAnual);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getTasasHandler,
  updateTasaHandler,
};
