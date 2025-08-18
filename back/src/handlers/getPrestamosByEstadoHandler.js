const getPrestamosByEstado = require("../controllers/getPrestamosByEstado");

const getPrestamosHandler = async (req, res) => {
  try {
    const { estado } = req.query; // o req.params si preferís
    const prestamos = await getPrestamosByEstado(estado);
    res.status(200).json(prestamos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = getPrestamosHandler;
