const { User } = require("../database");

const getUserById = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error("Usuario no encontrado con ese ID");
  }

  return user;
};

module.exports = getUserById;
