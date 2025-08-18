const addGarante = require("../controllers/addGarante");

const addGaranteHandler = async (req, res) => {
  try {
    const { dniUsuario, dniGarante } = req.body;

    const result = await addGarante(dniUsuario, dniGarante);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = addGaranteHandler;
