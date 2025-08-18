const { User } = require("../database");

const addGarante = async (dniUsuario, dniGarante) => {
  if (!dniUsuario || !dniGarante) {
    throw new Error("Faltan datos obligatorios (dniUsuario o dniGarante)");
  }

  if (dniUsuario === dniGarante) {
    throw new Error("Un usuario no puede ser garante de sí mismo");
  }

  const usuario = await User.findOne({ where: { dni: dniUsuario } });
  const garante = await User.findOne({ where: { dni: dniGarante } });

  if (!usuario || !garante) {
    throw new Error("Usuario o garante no encontrado");
  }

  // Relación muchos a muchos (usuario -> garante)
  await usuario.addGarantes(garante); // usando el alias definido en la asociación

  return { message: "Garante agregado correctamente" };
};

module.exports = addGarante;
