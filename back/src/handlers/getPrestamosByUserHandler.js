// handlers/getPrestamosByUserHandler.js
const { Prestamo, Cuota, User } = require('../database');

const getPrestamosByUserHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const prestamos = await Prestamo.findAll({
      where: { userId: id }, // ✅ FK correcta
      include: [
        {
          model: Cuota,
          as: 'cuotas', // ✅ este sí tiene alias
        },
        {
          model: User, // ✅ sin alias
        },
      ],
    });

    if (!prestamos.length) {
      return res.status(404).json({ message: 'Este usuario no tiene préstamos' });
    }

    res.status(200).json(prestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getPrestamosByUserHandler;
