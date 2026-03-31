const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../tructeca.db'), (err) => {
  if (err) {
    console.error('❌ Error abriendo BD:', err.message);
  } else {
    console.log('✅ Conectado a tructeca.db');
    // Habilitar foreign keys
    db.run('PRAGMA foreign_keys = ON');
  }
});

module.exports = db;