const db = require('../config/database');

// GET - Listar todos los clientes
exports.listar = (req, res) => {
  const { estado, nombre } = req.query;
  let query = 'SELECT * FROM clientes WHERE 1=1';
  const params = [];

  if (estado) {
    query += ' AND estado = ?';
    params.push(estado);
  }

  if (nombre) {
    query += ' AND LOWER(nombre_completo) LIKE ?';
    params.push('%' + nombre.toLowerCase() + '%');
  }

  query += ' ORDER BY nombre_completo ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error en listar clientes:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    res.json({
      success: true,
      data: rows,
      message: 'Clientes obtenidos'
    });
  });
};

// POST - Crear nuevo cliente
exports.crear = (req, res) => {
  const {
    nombre_completo,
    numero_identificacion,
    email,
    telefono,
    direccion
  } = req.body;

  // Validaciones
  if (!nombre_completo || !numero_identificacion) {
    return res.status(400).json({
      success: false,
      error: 'missing_fields',
      message: 'Nombre e identificación son requeridos'
    });
  }

  const query = `
    INSERT INTO clientes (
      nombre_completo,
      numero_identificacion,
      email,
      telefono,
      direccion,
      estado
    ) VALUES (?, ?, ?, ?, ?, 'activo')
  `;

  db.run(query, [
    nombre_completo,
    numero_identificacion,
    email,
    telefono,
    direccion
  ], function(err) {
    if (err) {
      console.error('Error en crear cliente:', err);
      
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({
          success: false,
          error: 'duplicate_identification',
          message: 'El número de identificación ya existe'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    // Obtener el cliente creado
    db.get('SELECT * FROM clientes WHERE id = ?', [this.lastID], (err, row) => {
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
        message: 'Cliente creado exitosamente'
      });
    });
  });
};

// GET - Obtener cliente por ID
exports.obtener = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM clientes WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error en obtener cliente:', err);
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
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: row,
      message: 'Cliente obtenido'
    });
  });
};

// PUT - Actualizar cliente
exports.actualizar = (req, res) => {
  const { id } = req.params;
  const { nombre_completo, email, telefono, direccion, estado } = req.body;

  const query = `
    UPDATE clientes
    SET
      nombre_completo = COALESCE(?, nombre_completo),
      email = COALESCE(?, email),
      telefono = COALESCE(?, telefono),
      direccion = COALESCE(?, direccion),
      estado = COALESCE(?, estado),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [nombre_completo, email, telefono, direccion, estado, id], function(err) {
    if (err) {
      console.error('Error en actualizar cliente:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    db.get('SELECT * FROM clientes WHERE id = ?', [id], (err, row) => {
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
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: row,
        message: 'Cliente actualizado'
      });
    });
  });
};

// DELETE - Eliminar cliente (inactivar)
exports.eliminar = (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE clientes
    SET estado = 'inactivo', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error en eliminar cliente:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    db.get('SELECT * FROM clientes WHERE id = ?', [id], (err, row) => {
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
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: row,
        message: 'Cliente eliminado (inactivado)'
      });
    });
  });
};