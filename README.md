# Operatora Audio - Audio Management System

A Node.js application for receiving audio files through API with a beautiful web UI dashboard for managing and monitoring audio files.

## Features

- 📤 **Audio Upload API** - RESTful API endpoint for uploading audio files
- 🎵 **Web Dashboard** - Modern, responsive web UI for viewing audio information
- 📊 **Statistics** - Real-time statistics about uploaded audio files
- 🎧 **Audio Player** - Built-in audio player for each uploaded file
- 🗑️ **File Management** - Delete audio files through the dashboard
- 📁 **Multiple Formats** - Supports MP3, WAV, OGG, M4A, AAC, FLAC, WEBM

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

## Usage

### Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

### API Endpoints

📖 **For detailed API documentation with examples in multiple languages (cURL, JavaScript, Python, Node.js, Postman, PowerShell), see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

#### Upload Audio File
```
POST /api/upload
Content-Type: multipart/form-data
Body: audio file (form field name: 'audio')
```

**Quick Example:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "audio=@/path/to/your/audio.mp3"
```

#### Get All Audio Files
```
GET /api/audio
```

#### Get Single Audio File
```
GET /api/audio/:id
```

#### Stream Audio File
```
GET /api/audio/:id/stream
```

#### Delete Audio File
```
DELETE /api/audio/:id
```

## Project Structure

```
operatora_audio/
├── server.js          # Main server file
├── package.json        # Dependencies and scripts
├── public/            # Web UI files
│   ├── index.html     # Dashboard HTML
│   ├── styles.css     # Dashboard styles
│   └── app.js         # Dashboard JavaScript
├── uploads/           # Uploaded audio files (created automatically)
└── data/              # Metadata storage (created automatically)
```

## Configuration

- **Port**: Default port is 3000. Set `PORT` environment variable to change it.
- **File Size Limit**: Currently set to 100MB. Modify in `server.js` if needed.
- **Supported Formats**: MP3, WAV, OGG, M4A, AAC, FLAC, WEBM

## Technologies Used

- **Express.js** - Web framework
- **Multer** - File upload handling
- **UUID** - Unique file naming
- **Vanilla JavaScript** - Frontend (no framework dependencies)

## License

ISC
