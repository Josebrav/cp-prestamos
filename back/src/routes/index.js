const {Router} = require('express');
const postUserHandler = require('../handlers/postUserHandler');
const deleteUserHandler = require('../handlers/deleteUserHandler');
const getUserByDniHandler = require('../handlers/getUserByDniHandler');

const getUserByIdHandler = require('../handlers/getUserByIdHandler');
const getPrestamosHandler = require('../handlers/getPrestamosByEstadoHandler');
const addGaranteHandler = require('../handlers/addGaranteHandler');
const postPrestamoHandler = require('../handlers/postPrestamoHandler');
const postAdminHandler = require('../handlers/postAdminHandler');
const getAllUsersHandler = require('../handlers/getAllUsersHandler');
const {
  getTasasHandler,
  updateTasaHandler,
} = require('../handlers/tasaConfigHandler');
const getPrestamoHandler = require('../handlers/getPrestamoHandler');
const putCuotaEstadoHandler = require('../handlers/putCuotaEstadoHandler');
const deletePrestamoHandler = require('../handlers/deletePrestamoHandler');
const putEstadoPrestamoHandler = require('../handlers/putEstadoPrestamoHandler');
const getAllPrestamosHandler = require('../handlers/getAllPrestamosHandler');
const getPrestamosByUserHandler = require('../handlers/getPrestamosByUserHandler');
const { updateUserHandler } = require('../handlers/updateUserHandler');


const router = Router();


router.get('/prestamos/usuario/:id', getPrestamosByUserHandler);
router.post('/registro', postUserHandler);
router.delete('/borrar', deleteUserHandler);
router.post('/buscar-dni', getUserByDniHandler);
router.get('/usuarios', getAllUsersHandler);
router.get("/usuario/:id", getUserByIdHandler);
router.put('/usuario/:id', updateUserHandler);
router.get("/prestamosestados", getPrestamosHandler);
router.post("/usuarios/agregar-garante", addGaranteHandler);
router.post("/admin/create", postAdminHandler);
router.post("/newprestamo", postPrestamoHandler);
router.get('/tasa', getTasasHandler);
router.put('/cuotas/:id/estado', putCuotaEstadoHandler);
// Eliminar préstamo
router.delete('/borrar/:id', deletePrestamoHandler);

// Cambiar estado del préstamo
router.put('/actualizarprestamo/:id/estado', putEstadoPrestamoHandler);

// Modificar una tasa por tipo (ej: /tasas/normal)
router.put('/tasas/:tipo', updateTasaHandler);

router.get('/prestamo/:id', getPrestamoHandler);
router.get('/prestamos/todos', getAllPrestamosHandler);


module.exports = router;
