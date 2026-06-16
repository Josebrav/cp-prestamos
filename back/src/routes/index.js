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
const { getPrestamosByMonthHandler } = require('../handlers/getPrestamoByMonthHandler');
const getPrestamosEnLegalesHandler = require('../handlers/getPrestamosLegalesHandlers');
const { cambiarPrestamoALegales } = require('../controllers/pasarPrestAlegales');
const { getQuitaCuotas, updateQuitaCuotas } = require('../controllers/quitaCuotasController');
const getRestante = require('../controllers/getRestante');
const { getCuotasVencidasMes } = require('../controllers/getCuotasVencidasMes');
const { getResumenSGP } = require('../controllers/resumen');
const { getTotalAcumulado } = require('../controllers/getTotalAcumulado');
const { getCuotaById, pagarCuota } = require('../controllers/cuotasController');
const putCuotaNumeroControlHandler = require('../handlers/putCuotaNumeroControlHandler');
const { deletePrestamoByNumeroControl } = require('../controllers/buscarprestamoxID');
const { getCurrentNControl, incrementNControl, getControl, sumarControl } = require('../controllers/nController');




const router = Router();


router.get('/prestamos/usuario/:id', getPrestamosByUserHandler);
router.post('/registro', postUserHandler);
router.delete('/borrar', deleteUserHandler);
router.post('/buscar-dni', getUserByDniHandler);
router.get('/usuarios', getAllUsersHandler);
router.get("/usuario/:id", getUserByIdHandler);
router.put('/usuario/:id', updateUserHandler);
router.get("/prestamosestados", getPrestamosHandler);
router.get('/prestamoslegales', getPrestamosEnLegalesHandler)
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
router.get('/prestamos/mes', getPrestamosByMonthHandler);
router.put('/prestamoenlegales', cambiarPrestamoALegales);
router.get('/prestamos/acobrar/mes', getCuotasVencidasMes);
router.delete('/prestamos/numero-control/:numeroControl', /* requireAdmin, */ deletePrestamoByNumeroControl);
// GET -> todas las configuraciones
router.get('/quitas', getQuitaCuotas);

// PUT -> modificar por tipo (ej: /quitas/tipo1)
router.put('/quitas/:tipo', updateQuitaCuotas);

router.get("/reportes/restante-futuro", getRestante)
router.get('/resumen', getResumenSGP);

router.get('/reportes/total-acumulado', getTotalAcumulado);
// Traer datos de una cuota
router.get("/cuotas/:id", getCuotaById);

// Registrar un pago de cuota
router.post("/cuotas/:id/pago", pagarCuota);

// Actualizar número de control de una cuota
router.put('/cuotas/:id/numero-control', putCuotaNumeroControlHandler);

router.get('/control', getControl);        // consultar valor
router.post('/control/sumar', sumarControl); // sumar 1



module.exports = router;
