const { getPrestamosByMonth } = require('../controllers/getPrestamoByMonth');

const getPrestamosByMonthHandler = async (req, res) => {
  try {
    const { year, month, soloACobrar } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: "Debes enviar año y mes" });
    }

    const prestamos = await getPrestamosByMonth(Number(year), Number(month), soloACobrar === 'true');
    res.json(prestamos);
  } catch (error) {
    console.error("Error en getPrestamosByMonthHandler:", error);
    return res.status(500).json({ error: "Error al obtener préstamos del mes" });
  }
};

module.exports = { getPrestamosByMonthHandler };
