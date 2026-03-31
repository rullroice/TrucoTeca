const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/reservas', reportesController.listarReservas);
router.get('/clientes', reportesController.listarClientes);
router.get('/libros', reportesController.listarLibros);
router.get('/empleados', reportesController.listarEmpleados);
router.get('/disponibilidad', reportesController.disponibilidad);

module.exports = router;