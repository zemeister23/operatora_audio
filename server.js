const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper function to sanitize folder name
function sanitizeFolderName(name) {
  // Remove special characters and replace spaces with underscores
  return name
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s-]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

// Temporary storage - files will be moved to proper folder after upload
const tempDir = path.join(uploadsDir, '.temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Storage configuration for multer - save files temporarily first
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to temp folder first, will move to proper folder after we get name/surname
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /audio\/(mp3|wav|ogg|m4a|aac|flac|webm)/;
    const extname = allowedTypes.test(file.mimetype);
    const extname2 = /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.originalname);
    
    if (extname || extname2) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

// Initialize database on startup
db.getDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// API Routes

// Upload audio file
app.post('/api/upload', upload.single('audio'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No audio file provided' });
    }

    tempFilePath = req.file.path; // Temporary file path

    // Get name and surname from form data (now available after multer processes)
    const name = (req.body.name || '').trim();
    const surname = (req.body.surname || '').trim();

    // Create folder name from name and surname
    let folderName = 'Unknown';
    if (name || surname) {
      const parts = [];
      if (name) parts.push(sanitizeFolderName(name));
      if (surname) parts.push(sanitizeFolderName(surname));
      folderName = parts.join('_') || 'Unknown';
    }
    
    // Create user folder
    const userFolder = path.join(uploadsDir, folderName);
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
      console.log(`Created folder for user: ${folderName}`);
    }
    
    // Move file from temp to proper folder
    const finalFileName = req.file.filename;
    const finalFilePath = path.join(userFolder, finalFileName);
    
    fs.renameSync(tempFilePath, finalFilePath);
    console.log(`Moved file from ${tempFilePath} to ${finalFilePath}`);

    const audioData = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: finalFileName,
      path: finalFilePath,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      duration: null, // Could be calculated with audio processing library
      format: path.extname(req.file.originalname).toLowerCase(),
      owner: {
        name: name,
        surname: surname
      }
    };

    console.log('Created audio data:', audioData);
    console.log(`File saved to folder: ${folderName}`);

    // Save to database
    await db.insertAudio(audioData);
    console.log('Audio saved to database successfully');

    res.json({
      success: true,
      message: 'Audio file uploaded successfully',
      audio: audioData
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    
    // If file was uploaded but something failed, try to delete the file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('Deleted temporary file due to error');
      } catch (deleteError) {
        console.error('Error deleting temporary file:', deleteError);
      }
    }
    
    res.status(500).json({ error: error.message || 'Failed to upload audio file' });
  }
});

// Get all audio files
app.get('/api/audio', async (req, res) => {
  try {
    const audioFiles = await db.getAllAudio();
    console.log(`API /audio requested, returning ${audioFiles.length} file(s)`);
    res.json(audioFiles);
  } catch (error) {
    console.error('Error fetching audio files:', error);
    res.status(500).json({ error: 'Failed to fetch audio files' });
  }
});

// Get single audio file by ID
app.get('/api/audio/:id', async (req, res) => {
  try {
    const audio = await db.getAudioById(req.params.id);
    
    if (!audio) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    
    res.json(audio);
  } catch (error) {
    console.error('Error fetching audio file:', error);
    res.status(500).json({ error: 'Failed to fetch audio file' });
  }
});

// Delete audio file
app.delete('/api/audio/:id', async (req, res) => {
  try {
    // Get audio info from database
    const audio = await db.getAudioById(req.params.id);
    
    if (!audio) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    
    // Delete from database
    await db.deleteAudio(req.params.id);
    
    // Delete the file from filesystem
    if (fs.existsSync(audio.path)) {
      fs.unlinkSync(audio.path);
      console.log(`Deleted file: ${audio.path}`);
      
      // Try to remove empty folder if it exists
      const folderPath = path.dirname(audio.path);
      try {
        const filesInFolder = fs.readdirSync(folderPath);
        if (filesInFolder.length === 0) {
          fs.rmdirSync(folderPath);
          console.log(`Removed empty folder: ${folderPath}`);
        }
      } catch (folderError) {
        // Ignore folder deletion errors
        console.log('Could not remove folder (may not be empty):', folderError.message);
      }
    }
    
    res.json({ success: true, message: 'Audio file deleted successfully' });
  } catch (error) {
    console.error('Error deleting audio file:', error);
    res.status(500).json({ error: 'Failed to delete audio file' });
  }
});

// Serve audio files
app.get('/api/audio/:id/stream', async (req, res) => {
  try {
    const audio = await db.getAudioById(req.params.id);
    
    if (!audio) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    
    if (!fs.existsSync(audio.path)) {
      return res.status(404).json({ error: 'Audio file not found on disk' });
    }
    
    res.sendFile(path.resolve(audio.path));
  } catch (error) {
    console.error('Error streaming audio file:', error);
    res.status(500).json({ error: 'Failed to stream audio file' });
  }
});

// Get user statistics
app.get('/api/users/stats', async (req, res) => {
  try {
    const stats = await db.getUserStatistics();
    console.log(`API /users/stats requested, returning ${stats.length} user(s)`);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get audio files by user
app.get('/api/users/:name/:surname/audio', async (req, res) => {
  try {
    const { name, surname } = req.params;
    const audioFiles = await db.getAudioByUser(name, surname);
    console.log(`API /users/${name}/${surname}/audio requested, returning ${audioFiles.length} file(s)`);
    res.json(audioFiles);
  } catch (error) {
    console.error('Error fetching user audio files:', error);
    res.status(500).json({ error: 'Failed to fetch user audio files' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await db.closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await db.closeDatabase();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
});
