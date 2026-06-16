const postUser = require('../controllers/postUser');

module.exports = async (req, res) => {

    try {
        const { name, surname, email, phone, dni, image, sueldo, lugarDeTrabajo,veraz,situacion,nacimiento,cuil,direccion } = req.body;
        if (!name || !surname || !dni) {
            throw new Error('Faltan datos obligatorios: name, surname o dni');
        }

        const result = await postUser(name, surname, email, phone, dni, image, sueldo, lugarDeTrabajo,veraz,situacion,nacimiento,cuil,direccion);

        // result: { user, created }
        if (result.created) {
            return res.status(201).json(result.user);
        }

        // If not created, a user with that DNI already exists
        return res.status(409).json({ error: 'Ya existe un usuario con ese DNI', user: result.user });
    } catch (error) {
        res.status(400).json({ error: `Error al crear usuario: ${error.message}` });
    }
}