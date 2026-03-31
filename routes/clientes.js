const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

// Listar clientes
router.get('/', clientesController.listar);

// Crear cliente
router.post('/', clientesController.crear);

// Obtener cliente específico
router.get('/:id', clientesController.obtener);

// Actualizar cliente
router.put('/:id', clientesController.actualizar);

// Eliminar cliente
router.delete('/:id', clientesController.eliminar);

module.exports = router;