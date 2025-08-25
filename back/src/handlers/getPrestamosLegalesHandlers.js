const getPrestamosEnLegales = require("../controllers/getPrestamosLegales");

const getPrestamosEnLegalesHandler = async (req, res) => {
  try {
    const prestamos = await getPrestamosEnLegales();
    res.status(200).json(prestamos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = getPrestamosEnLegalesHandler;
