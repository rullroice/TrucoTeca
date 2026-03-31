const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleadosController');

router.get('/', empleadosController.listar);
router.post('/', empleadosController.crear);
router.get('/:id', empleadosController.obtener);
router.put('/:id', empleadosController.actualizar);
router.delete('/:id', empleadosController.eliminar);

module.exports = router;