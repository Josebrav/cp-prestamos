const getUserById = require('../controllers/getUserById');

const getUserByIdHandler = async (req, res) => {
  const { id } = req.params; // ahora lo leemos de la URL

  try {
    if (!id) throw new Error("Falta el ID en la URL");

    const user = await getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = getUserByIdHandler;
