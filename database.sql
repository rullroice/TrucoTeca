-- ========================================
-- TRUCTECA - Base de Datos SQLite
-- ========================================

-- Tabla: clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_completo TEXT NOT NULL,
  numero_identificacion TEXT NOT NULL UNIQUE,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: empleados
CREATE TABLE IF NOT EXISTS empleados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_completo TEXT NOT NULL,
  numero_identificacion TEXT NOT NULL UNIQUE,
  email TEXT,
  telefono TEXT,
  cargo TEXT NOT NULL CHECK (cargo IN ('Bibliotecario', 'Asistente', 'Administrador')),
  fecha_contratacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: libros
CREATE TABLE IF NOT EXISTS libros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  isbn TEXT NOT NULL UNIQUE,
  editorial TEXT,
  ano_publicacion INTEGER,
  genero TEXT,
  cantidad_stock INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_stock >= 0),
  estado TEXT DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Reservado', 'Dañado')),
  fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: reservas
CREATE TABLE IF NOT EXISTS reservas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  libro_id INTEGER NOT NULL,
  empleado_id INTEGER,
  fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_estimada_devolucion DATETIME NOT NULL,
  fecha_real_devolucion DATETIME,
  estado TEXT DEFAULT 'Activa' CHECK (estado IN ('Pendiente', 'Activa', 'Devuelta', 'Cancelada')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (libro_id) REFERENCES libros(id),
  FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_empleados_estado ON empleados(estado);
CREATE INDEX IF NOT EXISTS idx_libros_estado ON libros(estado);
CREATE INDEX IF NOT EXISTS idx_libros_titulo ON libros(titulo);
CREATE INDEX IF NOT EXISTS idx_reservas_cliente ON reservas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_reservas_libro ON reservas(libro_id);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);

-- ========================================
-- DATOS DE PRUEBA
-- ========================================

INSERT OR IGNORE INTO clientes (nombre_completo, numero_identificacion, email, telefono, direccion, estado)
VALUES 
  ('Juan Pérez García', '12345678', 'juan@example.com', '912345678', 'Calle 1, Rancagua', 'activo'),
  ('María López Rodríguez', '87654321', 'maria@example.com', '987654321', 'Calle 2, Rancagua', 'activo'),
  ('Carlos Díaz Martínez', '11223344', 'carlos@example.com', '911223344', 'Calle 3, Rancagua', 'activo');

INSERT OR IGNORE INTO empleados (nombre_completo, numero_identificacion, email, telefono, cargo, estado)
VALUES 
  ('Ana Silva Flores', '55667788', 'ana@biblioteca.com', '955667788', 'Bibliotecario', 'activo'),
  ('Roberto Morales González', '99887766', 'roberto@biblioteca.com', '999887766', 'Asistente', 'activo'),
  ('Alejandra Ruiz Valenzuela', '44556677', 'alejandra@biblioteca.com', '944556677', 'Administrador', 'activo');

INSERT OR IGNORE INTO libros (titulo, autor, isbn, editorial, ano_publicacion, genero, cantidad_stock, estado)
VALUES 
  ('El Quijote', 'Miguel de Cervantes', '978-84-7496-000-0', 'Editorial Porrúa', 1605, 'Novela', 5, 'Disponible'),
  ('1984', 'George Orwell', '978-0-452-28423-4', 'Penguin Books', 1949, 'Ficción', 3, 'Disponible'),
  ('Cien años de soledad', 'Gabriel García Márquez', '978-0-06-085561-2', 'Harper & Row', 1967, 'Realismo Mágico', 2, 'Disponible'),
  ('El Principito', 'Antoine de Saint-Exupéry', '978-0-15-603760-0', 'Reynal & Hitchcock', 1943, 'Fantasía Infantil', 4, 'Disponible');

INSERT OR IGNORE INTO reservas (cliente_id, libro_id, empleado_id, fecha_estimada_devolucion, estado)
VALUES 
  (1, 1, 1, datetime('now', '+14 days'), 'Activa'),
  (2, 2, 1, datetime('now', '+14 days'), 'Activa'),
  (3, 3, 2, datetime('now', '+14 days'), 'Activa');