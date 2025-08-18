const { User } = require("../database")
//const sendMailHandler = require('../../utils/mailing/sendMailHandler');

const postUser = async ( name, surname, email, phone, dni, image, sueldo, lugarDeTrabajo,veraz,situacion,nacimiento ) => {
    try {
     
        const [newUser, created] = await User.findOrCreate({
            where: { dni },
            defaults: {
                name, surname, email, phone, dni, image,sueldo,lugarDeTrabajo,veraz,situacion,nacimiento/* , 
                driverId */
            }
          });
        
        
                    
        return newUser.dataValues;

    } catch (error) {
        throw new Error(`Error al crear el usuario (controller): ${error.message}`)
    }
}

module.exports = postUser;