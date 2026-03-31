const db = require('../config/database');

// GET - Listar empleados
exports.listar = (req, res) => {
  const { estado, cargo, nombre } = req.query;
  let query = 'SELECT * FROM empleados WHERE 1=1';
  const params = [];

  if (estado) {
    query += ' AND estado = ?';
    params.push(estado);
  }

  if (cargo) {
    query += ' AND cargo = ?';
    params.push(cargo);
  }

  if (nombre) {
    query += ' AND LOWER(nombre_completo) LIKE ?';
    params.push('%' + nombre.toLowerCase() + '%');
  }

  query += ' ORDER BY nombre_completo ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error en listar empleados:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    res.json({
      success: true,
      data: rows,
      message: 'Empleados obtenidos'
    });
  });
};

// POST - Crear empleado
exports.crear = (req, res) => {
  const {
    nombre_completo,
    numero_identificacion,
    email,
    telefono,
    cargo
  } = req.body;

  if (!nombre_completo || !numero_identificacion || !cargo) {
    return res.status(400).json({
      success: false,
      error: 'missing_fields',
      message: 'Nombre, identificación y cargo son requeridos'
    });
  }

  if (!['Bibliotecario', 'Asistente', 'Administrador'].includes(cargo)) {
    return res.status(400).json({
      success: false,
      error: 'invalid_cargo',
      message: 'Cargo debe ser: Bibliotecario, Asistente o Administrador'
    });
  }

  const query = `
    INSERT INTO empleados (
      nombre_completo,
      numero_identificacion,
      email,
      telefono,
      cargo,
      estado
    ) VALUES (?, ?, ?, ?, ?, 'activo')
  `;

  db.run(query, [
    nombre_completo,
    numero_identificacion,
    email,
    telefono,
    cargo
  ], function(err) {
    if (err) {
      console.error('Error en crear empleado:', err);
      
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

    db.get('SELECT * FROM empleados WHERE id = ?', [this.lastID], (err, row) => {
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
        message: 'Empleado creado exitosamente'
      });
    });
  });
};

// GET - Obtener empleado
exports.obtener = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM empleados WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error en obtener empleado:', err);
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
        message: 'Empleado no encontrado'
      });
    }

    res.json({
      success: true,
      data: row,
      message: 'Empleado obtenido'
    });
  });
};

// PUT - Actualizar empleado
exports.actualizar = (req, res) => {
  const { id } = req.params;
  const { nombre_completo, email, telefono, cargo, estado } = req.body;

  const query = `
    UPDATE empleados
    SET
      nombre_completo = COALESCE(?, nombre_completo),
      email = COALESCE(?, email),
      telefono = COALESCE(?, telefono),
      cargo = COALESCE(?, cargo),
      estado = COALESCE(?, estado),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [nombre_completo, email, telefono, cargo, estado, id], function(err) {
    if (err) {
      console.error('Error en actualizar empleado:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    db.get('SELECT * FROM empleados WHERE id = ?', [id], (err, row) => {
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
          message: 'Empleado no encontrado'
        });
      }

      res.json({
        success: true,
        data: row,
        message: 'Empleado actualizado'
      });
    });
  });
};

// DELETE - Eliminar empleado (inactivar)
exports.eliminar = (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE empleados
    SET estado = 'inactivo', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error en eliminar empleado:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    db.get('SELECT * FROM empleados WHERE id = ?', [id], (err, row) => {
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
          message: 'Empleado no encontrado'
        });
      }

      res.json({
        success: true,
        data: row,
        message: 'Empleado eliminado (inactivado)'
      });
    });
  });
};