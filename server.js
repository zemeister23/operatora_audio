const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

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

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
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

// Helper function to get audio metadata file path
const getMetadataPath = () => path.join(dataDir, 'audio-metadata.json');

// Helper function to read metadata
const readMetadata = () => {
  const metadataPath = getMetadataPath();
  if (fs.existsSync(metadataPath)) {
    try {
      const data = fs.readFileSync(metadataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
  return [];
};

// Helper function to write metadata
const writeMetadata = (metadata) => {
  const metadataPath = getMetadataPath();
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
};

// API Routes

// Upload audio file
app.post('/api/upload', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Get name and surname from form data
    const name = req.body.name || '';
    const surname = req.body.surname || '';

    const audioData = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      duration: null, // Could be calculated with audio processing library
      format: path.extname(req.file.originalname).toLowerCase(),
      owner: {
        name: name.trim(),
        surname: surname.trim()
      }
    };

    const metadata = readMetadata();
    metadata.push(audioData);
    writeMetadata(metadata);

    res.json({
      success: true,
      message: 'Audio file uploaded successfully',
      audio: audioData
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload audio file' });
  }
});

// Get all audio files
app.get('/api/audio', (req, res) => {
  try {
    const metadata = readMetadata();
    res.json(metadata);
  } catch (error) {
    console.error('Error fetching audio files:', error);
    res.status(500).json({ error: 'Failed to fetch audio files' });
  }
});

// Get single audio file by ID
app.get('/api/audio/:id', (req, res) => {
  try {
    const metadata = readMetadata();
    const audio = metadata.find(a => a.id === req.params.id);
    
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
app.delete('/api/audio/:id', (req, res) => {
  try {
    const metadata = readMetadata();
    const audioIndex = metadata.findIndex(a => a.id === req.params.id);
    
    if (audioIndex === -1) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    
    const audio = metadata[audioIndex];
    
    // Delete the file from filesystem
    if (fs.existsSync(audio.path)) {
      fs.unlinkSync(audio.path);
    }
    
    // Remove from metadata
    metadata.splice(audioIndex, 1);
    writeMetadata(metadata);
    
    res.json({ success: true, message: 'Audio file deleted successfully' });
  } catch (error) {
    console.error('Error deleting audio file:', error);
    res.status(500).json({ error: 'Failed to delete audio file' });
  }
});

// Serve audio files
app.get('/api/audio/:id/stream', (req, res) => {
  try {
    const metadata = readMetadata();
    const audio = metadata.find(a => a.id === req.params.id);
    
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
});
