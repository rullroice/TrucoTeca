const db = require('../config/database');

// GET - Listar libros
exports.listar = (req, res) => {
  const { estado, titulo, autor, genero } = req.query;
  let query = 'SELECT * FROM libros WHERE 1=1';
  const params = [];

  if (estado) {
    query += ' AND estado = ?';
    params.push(estado);
  }

  if (titulo) {
    query += ' AND LOWER(titulo) LIKE ?';
    params.push('%' + titulo.toLowerCase() + '%');
  }

  if (autor) {
    query += ' AND LOWER(autor) LIKE ?';
    params.push('%' + autor.toLowerCase() + '%');
  }

  if (genero) {
    query += ' AND LOWER(genero) LIKE ?';
    params.push('%' + genero.toLowerCase() + '%');
  }

  query += ' ORDER BY titulo ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error en listar libros:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    res.json({
      success: true,
      data: rows,
      message: 'Libros obtenidos'
    });
  });
};

// POST - Crear libro
exports.crear = (req, res) => {
  const {
    titulo,
    autor,
    isbn,
    editorial,
    ano_publicacion,
    genero,
    cantidad_stock
  } = req.body;

  if (!titulo || !autor || !isbn) {
    return res.status(400).json({
      success: false,
      error: 'missing_fields',
      message: 'Título, autor e ISBN son requeridos'
    });
  }

  const query = `
    INSERT INTO libros (
      titulo,
      autor,
      isbn,
      editorial,
      ano_publicacion,
      genero,
      cantidad_stock,
      estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Disponible')
  `;

  db.run(query, [
    titulo,
    autor,
    isbn,
    editorial,
    ano_publicacion,
    genero,
    cantidad_stock || 0
  ], function(err) {
    if (err) {
      console.error('Error en crear libro:', err);
      
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({
          success: false,
          error: 'duplicate_isbn',
          message: 'El ISBN ya existe'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    db.get('SELECT * FROM libros WHERE id = ?', [this.lastID], (err, row) => {
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
        message: 'Libro creado exitosamente'
      });
    });
  });
};

// GET - Obtener libro
exports.obtener = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM libros WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error en obtener libro:', err);
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
        message: 'Libro no encontrado'
      });
    }

    res.json({
      success: true,
      data: row,
      message: 'Libro obtenido'
    });
  });
};

// PUT - Actualizar libro
exports.actualizar = (req, res) => {
  const { id } = req.params;
  const { titulo, autor, editorial, ano_publicacion, genero, estado } = req.body;

  const query = `
    UPDATE libros
    SET
      titulo = COALESCE(?, titulo),
      autor = COALESCE(?, autor),
      editorial = COALESCE(?, editorial),
      ano_publicacion = COALESCE(?, ano_publicacion),
      genero = COALESCE(?, genero),
      estado = COALESCE(?, estado),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [titulo, autor, editorial, ano_publicacion, genero, estado, id], function(err) {
    if (err) {
      console.error('Error en actualizar libro:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    db.get('SELECT * FROM libros WHERE id = ?', [id], (err, row) => {
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
          message: 'Libro no encontrado'
        });
      }

      res.json({
        success: true,
        data: row,
        message: 'Libro actualizado'
      });
    });
  });
};

// DELETE - Cambiar estado del libro a Dañado
exports.eliminar = (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE libros
    SET estado = 'Dañado', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error en eliminar libro:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    db.get('SELECT * FROM libros WHERE id = ?', [id], (err, row) => {
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
          message: 'Libro no encontrado'
        });
      }

      res.json({
        success: true,
        data: row,
        message: 'Libro marcado como dañado'
      });
    });
  });
};

// POST - Registrar entrada de libros
exports.registrarEntrada = (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({
      success: false,
      error: 'invalid_quantity',
      message: 'Cantidad debe ser mayor a 0'
    });
  }

  const query = `
    UPDATE libros
    SET
      cantidad_stock = cantidad_stock + ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [cantidad, id], function(err) {
    if (err) {
      console.error('Error en registrar entrada:', err);
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: err.message
      });
    }

    db.get('SELECT * FROM libros WHERE id = ?', [id], (err, row) => {
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
          message: 'Libro no encontrado'
        });
      }

      res.json({
        success: true,
        data: row,
        message: `${cantidad} unidades agregadas al stock`
      });
    });
  });
};