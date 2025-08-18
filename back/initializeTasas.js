// src/utils/initializeTasas.js
const { TasaConfig } = require('../back/src/database');

const initializeTasas = async () => {
  const tipos = ['normal', 'veraz1', 'veraz2'];
  const tasasIniciales = {
    normal: 50.00,
    veraz1: 60.00,
    veraz2: 70.00,
  };

  for (const tipo of tipos) {
    const [tasa, created] = await TasaConfig.findOrCreate({
      where: { tipo },
      defaults: {
        tasaAnual: tasasIniciales[tipo],
      }
    });

    if (created) {
      console.log(`Tasa creada para ${tipo}: ${tasasIniciales[tipo]}%`);
    } else {
      console.log(`Tasa existente para ${tipo}`);
    }
  }
};

module.exports = initializeTasas;
