const db = require('../config/database');

// GET - Listar reservas
exports.listar = (req, res) => {
  const { estado, cliente_id } = req.query;
  let query = `
    SELECT 
      r.id,
      r.cliente_id,
      c.nombre_completo as cliente_nombre,
      r.libro_id,
      l.titulo as libro_titulo,
      r.empleado_id,
      e.nombre_completo as empleado_nombre,
      r.fecha_reserva,
      r.fecha_estimada_devolucion,
      r.fecha_real_devolucion,
      r.estado
    FROM reservas r
    LEFT JOIN clientes c ON r.cliente_id = c.id
    LEFT JOIN libros l ON r.libro_id = l.id
    LEFT JOIN empleados e ON r.empleado_id = e.id
    WHERE 1=1
  `;
  const params = [];

  if (estado) {
    query += ' AND r.estado = ?';
    params.push(estado);
  }

  if (cliente_id) {
    query += ' AND r.cliente_id = ?';
    params.push(cliente_id);
  }

  query += ' ORDER BY r.fecha_reserva DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error en listar reservas:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    res.json({
      success: true,
      data: rows,
      message: 'Reservas obtenidas'
    });
  });
};

// POST - Crear reserva
exports.crear = (req, res) => {
  const {
    cliente_id,
    libro_id,
    empleado_id,
    fecha_estimada_devolucion
  } = req.body;

  if (!cliente_id || !libro_id || !fecha_estimada_devolucion) {
    return res.status(400).json({
      success: false,
      error: 'missing_fields',
      message: 'Cliente, libro y fecha de devolución son requeridos'
    });
  }

  // Verificar cliente
  db.get('SELECT id FROM clientes WHERE id = ?', [cliente_id], (err, cliente) => {
    if (err || !cliente) {
      return res.status(404).json({
        success: false,
        error: 'client_not_found',
        message: 'Cliente no encontrado'
      });
    }

    // Verificar libro
    db.get('SELECT id FROM libros WHERE id = ?', [libro_id], (err, libro) => {
      if (err || !libro) {
        return res.status(404).json({
          success: false,
          error: 'book_not_found',
          message: 'Libro no encontrado'
        });
      }

      const query = `
        INSERT INTO reservas (
          cliente_id,
          libro_id,
          empleado_id,
          fecha_estimada_devolucion,
          estado
        ) VALUES (?, ?, ?, ?, 'Activa')
      `;

      db.run(query, [
        cliente_id,
        libro_id,
        empleado_id || null,
        fecha_estimada_devolucion
      ], function(err) {
        if (err) {
          console.error('Error en crear reserva:', err);
          return res.status(500).json({
            success: false,
            error: 'database_error',
            message: err.message
          });
        }

        const selectQuery = `
          SELECT 
            r.id,
            r.cliente_id,
            c.nombre_completo as cliente_nombre,
            r.libro_id,
            l.titulo as libro_titulo,
            r.estado,
            r.fecha_reserva,
            r.fecha_estimada_devolucion
          FROM reservas r
          LEFT JOIN clientes c ON r.cliente_id = c.id
          LEFT JOIN libros l ON r.libro_id = l.id
          WHERE r.id = ?
        `;

        db.get(selectQuery, [this.lastID], (err, row) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'database_error',
              message: err.message
            });
          }

          res.status(201).json({
            success: true,
            data: row,
            message: 'Reserva creada exitosamente'
          });
        });
      });
    });
  });
};

// GET - Obtener reserva
exports.obtener = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      r.id,
      r.cliente_id,
      c.nombre_completo as cliente_nombre,
      r.libro_id,
      l.titulo as libro_titulo,
      r.empleado_id,
      e.nombre_completo as empleado_nombre,
      r.fecha_reserva,
      r.fecha_estimada_devolucion,
      r.fecha_real_devolucion,
      r.estado
    FROM reservas r
    LEFT JOIN clientes c ON r.cliente_id = c.id
    LEFT JOIN libros l ON r.libro_id = l.id
    LEFT JOIN empleados e ON r.empleado_id = e.id
    WHERE r.id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error en obtener reserva:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Reserva no encontrada'
      });
    }

    res.json({
      success: true,
      data: row,
      message: 'Reserva obtenida'
    });
  });
};

// PUT - Registrar devolución
exports.devolución = (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE reservas
    SET
      estado = 'Devuelta',
      fecha_real_devolucion = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error en devolución:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    const selectQuery = `
      SELECT 
        r.id,
        r.cliente_id,
        c.nombre_completo as cliente_nombre,
        r.libro_id,
        l.titulo as libro_titulo,
        r.estado,
        r.fecha_real_devolucion
      FROM reservas r
      LEFT JOIN clientes c ON r.cliente_id = c.id
      LEFT JOIN libros l ON r.libro_id = l.id
      WHERE r.id = ?
    `;

    db.get(selectQuery, [id], (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'database_error',
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          error: 'not_found',
          message: 'Reserva no encontrada'
        });
      }

      res.json({
        success: true,
        data: row,
        message: 'Devolución registrada'
      });
    });
  });
};

// DELETE - Cancelar reserva
exports.eliminar = (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE reservas
    SET
      estado = 'Cancelada',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error en cancelar reserva:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    db.get('SELECT * FROM reservas WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'database_error',
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          error: 'not_found',
          message: 'Reserva no encontrada'
        });
      }

      res.json({
        success: true,
        data: row,
        message: 'Reserva cancelada'
      });
    });
  });
};