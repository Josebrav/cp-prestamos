const getUserBySurnameController = require("../controllers/getUserBySurname");

const getUserBySurnameHandler = async (req, res) => {
  try {
    const { surname } = req.body;

    if (!surname) {
      return res.status(400).json({ error: "Apellido es requerido" });
    }

    const users = await getUserBySurnameController(surname);

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No se encontraron usuarios con ese apellido" });
    }

    res.json(users);
  } catch (error) {
    console.error("Error en getUserBySurnameHandler:", error);
    res.status(500).json({ error: "Error al buscar usuarios por apellido" });
  }
};

module.exports = getUserBySurnameHandler;
