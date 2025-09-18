// src/utils/initControl.js
const { Control } = require('../src/database');

const initControl = async () => {
  // valor inicial configurable (default 0)
  const initial = Number(process.env.CONTROL_INIT ?? 23000);

  // asegurá UNA sola fila (id=1)
  const [row, created] = await Control.findOrCreate({
    where: { id: 1 },
    defaults: { numero: initial },
  });

  // si existe pero sin numero, lo normalizamos
  if (!created && (row.numero === null || row.numero === undefined)) {
    row.numero = initial;
    await row.save();
  }
};

module.exports = initControl;
