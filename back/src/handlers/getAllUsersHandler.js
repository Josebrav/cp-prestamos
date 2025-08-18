const getAllUsers = require('../controllers/getAllUsers');

const getAllUsersHandler = async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(400).json({ error: `Error al obtener usuarios: ${error.message}` });
  }
};

module.exports = getAllUsersHandler;
