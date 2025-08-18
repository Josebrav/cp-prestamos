const postPrestamo = require("../controllers/postPrestamo");

const postPrestamoHandler = async (req, res) => {
  try {
    const prestamo = await postPrestamo(req.body);
    res.status(201).json(prestamo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = postPrestamoHandler;
