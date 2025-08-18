// src/handlers/deletePrestamoHandler.js
const deletePrestamo = require('../controllers/deletePrestamo');

const deletePrestamoHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deletePrestamo(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = deletePrestamoHandler;
