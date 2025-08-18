// src/controllers/tasaConfigController.js
const { TasaConfig } = require('../database');

const getTasas = async () => {
  const tasas = await TasaConfig.findAll();
  return tasas;
};

const updateTasa = async (tipo, nuevaTasa) => {
  const tasa = await TasaConfig.findByPk(tipo);
  if (!tasa) {
    throw new Error(`No se encontró la tasa con tipo: ${tipo}`);
  }

  tasa.tasaAnual = nuevaTasa;
  await tasa.save();

  return tasa;
};

module.exports = { getTasas, updateTasa };
