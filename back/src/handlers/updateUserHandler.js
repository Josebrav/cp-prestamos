// controllers/userController.js
const { User } = require('../database');

const updateUserHandler = async (req, res) => {
  const { id } = req.params;       // ID del usuario a modificar
  const updatedData = req.body;    // Datos a actualizar

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Actualiza el usuario
    await user.update(updatedData);

    res.json({ message: "Usuario actualizado correctamente", user });
  } catch (err) {
    console.error("❌ Error al actualizar usuario:", err);
    res.status(500).json({ error: "No se pudo actualizar el usuario" });
  }
};

module.exports = { updateUserHandler };
