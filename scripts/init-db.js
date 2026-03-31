const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../tructeca.db');

console.log('🔧 Inicializando base de datos de TrucoTeca...\n');

// Si la BD ya existe, eliminarla
if (fs.existsSync(dbPath)) {
  console.log('⚠️  tructeca.db ya existe. Recreando...');
  fs.unlinkSync(dbPath);
}

// Crear nueva BD
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al crear BD:', err.message);
    process.exit(1);
  }

  console.log('✅ Base de datos creada');

  // Habilitar foreign keys
  db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) {
      console.error('❌ Error habilitando foreign keys:', err.message);
      process.exit(1);
    }

    // Leer y ejecutar SQL
    const sqlFile = path.join(__dirname, '../database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar SQL línea por línea
    db.exec(sql, (err) => {
      if (err) {
        console.error('❌ Error al ejecutar SQL:', err.message);
        process.exit(1);
      }

      console.log('✅ Base de datos inicializada correctamente\n');
      console.log(`📁 Archivo: ${dbPath}`);
      console.log(`📊 Tablas creadas: clientes, empleados, libros, reservas`);
      console.log(`📋 Índices creados: 8 para búsquedas rápidas`);
      console.log(`🎯 Datos de prueba: Insertados`);
      console.log('\n✅ ¡BD lista para usar!\n');

      db.close();
    });
  });
});