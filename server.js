const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (Frontend)
app.use(express.static('public'));

// Rutas API
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/empleados', require('./routes/empleados'));
app.use('/api/libros', require('./routes/libros'));
app.use('/api/reservas', require('./routes/reservas'));
app.use('/api/reportes', require('./routes/reportes'));

// Ruta raíz - Servir index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'server_error',
    message: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TrucoTeca ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Base de datos: tructeca.db`);
  console.log(`🔄 Cambios automáticos: nodemon activo`);
});