// src/handlers/getAllPrestamosHandler.js
const { Prestamo, User, Cuota } = require('../database');

const getAllPrestamosHandler = async (req, res) => {
  try {
    const prestamos = await Prestamo.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'surname', 'dni']
        },
        {
  model: Cuota,
  as: 'cuotas',
  attributes: ['id', 'numeroCuota', 'monto', 'fechaVencimiento', 'estado', 'montoConInteres']
}

      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(prestamos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los préstamos' });
  }
};

module.exports = getAllPrestamosHandler;
