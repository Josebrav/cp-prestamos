const { QuitaCuotas } = require('../database'); // Ajustá la ruta según tu estructura

// Obtener todas las configuraciones
const getQuitaCuotas = async (req, res) => {
  try {
    const configs = await QuitaCuotas.findAll();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las configuraciones', details: error.message });
  }
};

// Modificar una configuración por tipo
const updateQuitaCuotas = async (req, res) => {
  try {
    const { tipo } = req.params;
    const { porcentaje } = req.body;

    if (porcentaje < 0 || porcentaje > 100) {
      return res.status(400).json({ error: 'El porcentaje debe estar entre 0 y 100' });
    }

    const config = await QuitaCuotas.findOne({ where: { tipo } });
    if (!config) {
      return res.status(404).json({ error: `No existe configuración para el tipo: ${tipo}` });
    }

    config.porcentaje = porcentaje;
    await config.save();

    res.json({ message: 'Configuración actualizada con éxito', config });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la configuración', details: error.message });
  }
};

module.exports = {
  getQuitaCuotas,
  updateQuitaCuotas,
};
