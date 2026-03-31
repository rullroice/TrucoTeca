const db = require('../config/database');

// GET - Reporte de reservas
exports.listarReservas = (req, res) => {
  const query = `
    SELECT 
      r.id,
      c.nombre_completo as cliente,
      l.titulo as libro,
      r.fecha_reserva,
      r.fecha_estimada_devolucion,
      r.fecha_real_devolucion,
      r.estado
    FROM reservas r
    LEFT JOIN clientes c ON r.cliente_id = c.id
    LEFT JOIN libros l ON r.libro_id = l.id
    ORDER BY r.fecha_reserva DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error en reporte reservas:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    res.json({
      success: true,
      data: rows,
      message: 'Reporte de reservas'
    });
  });
};

// GET - Reporte de clientes
exports.listarClientes = (req, res) => {
  const query = `
    SELECT 
      c.id,
      c.nombre_completo,
      c.numero_identificacion,
      c.email,
      c.telefono,
      c.estado,
      COUNT(r.id) as total_reservas
    FROM clientes c
    LEFT JOIN reservas r ON c.id = r.cliente_id
    WHERE c.estado = 'activo'
    GROUP BY c.id
    ORDER BY c.nombre_completo ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error en reporte clientes:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    res.json({
      success: true,
      data: rows,
      message: 'Reporte de clientes'
    });
  });
};

// GET - Reporte de libros
exports.listarLibros = (req, res) => {
  const query = `
    SELECT 
      id,
      titulo,
      autor,
      isbn,
      editorial,
      ano_publicacion,
      genero,
      cantidad_stock,
      estado
    FROM libros
    ORDER BY titulo ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error en reporte libros:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    res.json({
      success: true,
      data: rows,
      message: 'Reporte de libros'
    });
  });
};

// GET - Reporte de empleados
exports.listarEmpleados = (req, res) => {
  const query = `
    SELECT 
      id,
      nombre_completo,
      numero_identificacion,
      email,
      telefono,
      cargo,
      estado
    FROM empleados
    WHERE estado = 'activo'
    ORDER BY nombre_completo ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error en reporte empleados:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    res.json({
      success: true,
      data: rows,
      message: 'Reporte de empleados'
    });
  });
};

// GET - Reporte de disponibilidad
exports.disponibilidad = (req, res) => {
  const query = `
    SELECT 
      id,
      titulo,
      autor,
      cantidad_stock,
      estado,
      CASE 
        WHEN estado = 'Disponible' THEN 'Disponible'
        WHEN estado = 'Reservado' THEN 'Reservado'
        WHEN estado = 'Dañado' THEN 'Dañado'
      END as status
    FROM libros
    ORDER BY estado, titulo ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error en reporte disponibilidad:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    res.json({
      success: true,
      data: rows,
      message: 'Reporte de disponibilidad'
    });
  });
};