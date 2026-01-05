const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data', 'audio.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    // Create table if not exists
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS audio_files (
          id TEXT PRIMARY KEY,
          original_name TEXT NOT NULL,
          filename TEXT NOT NULL,
          file_path TEXT NOT NULL,
          size INTEGER NOT NULL,
          mimetype TEXT,
          uploaded_at TEXT NOT NULL,
          duration INTEGER,
          format TEXT,
          owner_name TEXT,
          owner_surname TEXT
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
        } else {
          console.log('Database table ready');
          resolve(db);
        }
      });
    });
  });
}

// Get database instance
let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    dbInstance = await initDatabase();
  }
  return dbInstance;
}

// Insert audio file record
function insertAudio(audioData) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    
    db.run(`
      INSERT INTO audio_files (
        id, original_name, filename, file_path, size, mimetype,
        uploaded_at, duration, format, owner_name, owner_surname
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      audioData.id,
      audioData.originalName,
      audioData.filename,
      audioData.path,
      audioData.size,
      audioData.mimetype,
      audioData.uploadedAt,
      audioData.duration || null,
      audioData.format,
      audioData.owner?.name || '',
      audioData.owner?.surname || ''
    ], function(err) {
      if (err) {
        console.error('Error inserting audio:', err);
        reject(err);
      } else {
        console.log(`Audio inserted with ID: ${audioData.id}`);
        resolve({ ...audioData, rowid: this.lastID });
      }
    });
  });
}

// Get all audio files
function getAllAudio() {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    
    db.all(`
      SELECT 
        id, original_name, filename, file_path as path, size, mimetype,
        uploaded_at as uploadedAt, duration, format, owner_name, owner_surname
      FROM audio_files
      ORDER BY uploaded_at DESC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching audio files:', err);
        reject(err);
      } else {
        // Transform rows to match expected format
        const audioFiles = rows.map(row => ({
          id: row.id,
          originalName: row.original_name,
          filename: row.filename,
          path: row.path,
          size: row.size,
          mimetype: row.mimetype,
          uploadedAt: row.uploadedAt,
          duration: row.duration,
          format: row.format,
          owner: {
            name: row.owner_name || '',
            surname: row.owner_surname || ''
          }
        }));
        console.log(`Fetched ${audioFiles.length} audio file(s) from database`);
        resolve(audioFiles);
      }
    });
  });
}

// Get audio file by ID
function getAudioById(id) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    
    db.get(`
      SELECT 
        id, original_name, filename, file_path as path, size, mimetype,
        uploaded_at as uploadedAt, duration, format, owner_name, owner_surname
      FROM audio_files
      WHERE id = ?
    `, [id], (err, row) => {
      if (err) {
        console.error('Error fetching audio file:', err);
        reject(err);
      } else if (!row) {
        resolve(null);
      } else {
        const audioFile = {
          id: row.id,
          originalName: row.original_name,
          filename: row.filename,
          path: row.path,
          size: row.size,
          mimetype: row.mimetype,
          uploadedAt: row.uploadedAt,
          duration: row.duration,
          format: row.format,
          owner: {
            name: row.owner_name || '',
            surname: row.owner_surname || ''
          }
        };
        resolve(audioFile);
      }
    });
  });
}

// Delete audio file
function deleteAudio(id) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    
    // First get the file path
    getAudioById(id).then(audio => {
      if (!audio) {
        reject(new Error('Audio file not found'));
        return;
      }
      
      // Delete from database
      db.run('DELETE FROM audio_files WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error deleting audio:', err);
          reject(err);
        } else {
          console.log(`Audio deleted with ID: ${id}`);
          resolve(audio);
        }
      });
    }).catch(reject);
  });
}

// Get user statistics
function getUserStatistics() {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    db.all(`
      SELECT 
        owner_name,
        owner_surname,
        COUNT(*) as total_count,
        SUM(CASE WHEN DATE(uploaded_at) = ? THEN 1 ELSE 0 END) as today_count
      FROM audio_files
      WHERE owner_name != '' OR owner_surname != ''
      GROUP BY owner_name, owner_surname
      ORDER BY owner_name, owner_surname
    `, [today], (err, rows) => {
      if (err) {
        console.error('Error fetching user statistics:', err);
        reject(err);
      } else {
        const stats = rows.map(row => ({
          name: row.owner_name || '',
          surname: row.owner_surname || '',
          totalAudios: row.total_count,
          todayAudios: row.today_count
        }));
        console.log(`Fetched statistics for ${stats.length} user(s)`);
        resolve(stats);
      }
    });
  });
}

// Get audio files by user (name and surname)
function getAudioByUser(name, surname) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    
    db.all(`
      SELECT 
        id, original_name, filename, file_path as path, size, mimetype,
        uploaded_at as uploadedAt, duration, format, owner_name, owner_surname
      FROM audio_files
      WHERE owner_name = ? AND owner_surname = ?
      ORDER BY uploaded_at DESC
    `, [name || '', surname || ''], (err, rows) => {
      if (err) {
        console.error('Error fetching user audio files:', err);
        reject(err);
      } else {
        const audioFiles = rows.map(row => ({
          id: row.id,
          originalName: row.original_name,
          filename: row.filename,
          path: row.path,
          size: row.size,
          mimetype: row.mimetype,
          uploadedAt: row.uploadedAt,
          duration: row.duration,
          format: row.format,
          owner: {
            name: row.owner_name || '',
            surname: row.owner_surname || ''
          }
        }));
        console.log(`Fetched ${audioFiles.length} audio file(s) for user: ${name} ${surname}`);
        resolve(audioFiles);
      }
    });
  });
}

// Close database connection
function closeDatabase() {
  return new Promise(async (resolve) => {
    if (dbInstance) {
      dbInstance.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
        dbInstance = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  getDatabase,
  insertAudio,
  getAllAudio,
  getAudioById,
  deleteAudio,
  getUserStatistics,
  getAudioByUser,
  closeDatabase
};
