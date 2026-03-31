const express = require('express');
const router = express.Router();
const librosController = require('../controllers/librosController');

router.get('/', librosController.listar);
router.post('/', librosController.crear);
router.get('/:id', librosController.obtener);
router.put('/:id', librosController.actualizar);
router.delete('/:id', librosController.eliminar);

// Registrar entrada de libros
router.post('/:id/entrada', librosController.registrarEntrada);

module.exports = router;