const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');

router.get('/', reservasController.listar);
router.post('/', reservasController.crear);
router.get('/:id', reservasController.obtener);

// Registrar devolución
router.put('/:id/devolver', reservasController.devolución);

// Cancelar reserva
router.delete('/:id', reservasController.eliminar);

module.exports = router;