const postUser = require('../controllers/postUser');

module.exports = async (req, res) => {

    try {
        const { name, surname, email, phone, dni, image, sueldo, lugarDeTrabajo,veraz,situacion,nacimiento } = req.body;
        if( !name || !surname || !dni ){
            throw new Error(`Error, no se recibieron los datos para crear el usuario ${error.message}`) 
        }
        const newUser = await postUser(name, surname, email, phone, dni, image, sueldo, lugarDeTrabajo,veraz,situacion,nacimiento);
        res.status(200).json(newUser);
    } catch (error) {
        res.status(400).json(`Error al crear usuario (handler): ${error.message}`)
    }
}