const { Admin } = require("../database");

const postAdmin = async (name, password) => {
  if (!name || !password) {
    throw new Error("Faltan campos obligatorios: name y password");
  }

  // Podrías validar que no se repita el nombre
  const existingAdmin = await Admin.findOne({ where: { name } });
  if (existingAdmin) {
    throw new Error("El administrador ya existe");
  }

  const newAdmin = await Admin.create({ name, password });
  return newAdmin;
};

module.exports = postAdmin;
