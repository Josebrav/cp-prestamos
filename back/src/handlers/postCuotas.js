// src/handlers/postCuotas.js
const createCuotas = require('../controllers/createCuota');

const postCuotas = async (req, res) => {
  try {
    const cuotas = await createCuotas(req.body);
    res.status(201).json(cuotas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = postCuotas;
