const postAdmin = require("../controllers/postAdmin");

const postAdminHandler = async (req, res) => {
  try {
    const { name, password } = req.body;
    const newAdmin = await postAdmin(name, password);
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = postAdminHandler;
