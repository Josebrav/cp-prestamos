// handler/userHandlers.js
const getUserByDniController = require("../controllers/getUserByDni");

const getUserByDniHandler = async (req, res) => {
  try {
    const { dni } = req.body;

    if (!dni) {
      return res.status(400).json({ error: "DNI es requerido" });
    }

    const user = await getUserByDniController(dni);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error en getUserByDniHandler:", error);
    res.status(500).json({ error: "Error al buscar usuario por DNI" });
  }
};

module.exports = getUserByDniHandler;
