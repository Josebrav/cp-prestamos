const updateCuotaNumeroControl = require('../controllers/updateCuotaNumeroControl');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const { numeroControl } = req.body;
    if (!numeroControl) return res.status(400).json({ error: 'Falta numeroControl' });

    const cuotaActualizada = await updateCuotaNumeroControl(id, numeroControl);
    return res.status(200).json(cuotaActualizada);
  } catch (err) {
    if (err.code === 'DUPLICATE') return res.status(409).json({ error: err.message });
    return res.status(400).json({ error: err.message });
  }
};
