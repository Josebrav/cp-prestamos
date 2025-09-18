// src/controllers/nController.js  (o controlController.js)
const { Control } = require('../database');

// Asegura que exista la fila id=1
async function ensureControl() {
  const initial = Number(process.env.CONTROL_INIT ?? 23000);
  const [row] = await Control.findOrCreate({
    where: { id: 1 },
    defaults: { numero: initial },
  });
  return row;
}

// GET /control -> devuelve el valor actual
async function getControl(req, res) {
  try {
    const row = await ensureControl();
    return res.json({ numero: row.numero });
  } catch (err) {
    console.error('getControl error:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

// POST /control/sumar -> suma 1 y devuelve el nuevo valor
async function sumarControl(req, res) {
  try {
    await ensureControl();
    // No desestructurar el retorno; en algunos dialectos es un número
    await Control.increment('numero', { by: 1, where: { id: 1 } });

    // Recargar para obtener el valor actualizado
    const row = await Control.findByPk(1);
    return res.json({ numero: row.numero });
  } catch (err) {
    console.error('sumarControl error:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { getControl, sumarControl };
