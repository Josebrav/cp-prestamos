// src/handlers/getPrestamoHandler.js
const getPrestamo = require('../controllers/getPrestamo');

const getPrestamoHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await getPrestamo(id);
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = getPrestamoHandler;
