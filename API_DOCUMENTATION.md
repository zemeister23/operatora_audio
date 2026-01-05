# API Documentation - Audio Upload

This document provides comprehensive instructions for uploading audio files to the Operatora Audio API.

## Base URL

```
http://localhost:3000/api
```

## Upload Audio File

Upload an audio file to the server using a multipart/form-data request.

### Endpoint

```
POST /api/upload
```

### Request

**Method:** `POST`  
**Content-Type:** `multipart/form-data`  
**Body:** Form data with audio file

#### Form Fields

- **Field Name:** `audio`
  - **Type:** File
  - **Required:** Yes
  - **Accepted Formats:** MP3, WAV, OGG, M4A, AAC, FLAC, WEBM
  - **Max File Size:** 100 MB

- **Field Name:** `name`
  - **Type:** String
  - **Required:** No (Optional)
  - **Description:** Owner's first name

- **Field Name:** `surname`
  - **Type:** String
  - **Required:** No (Optional)
  - **Description:** Owner's surname

### Response

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Audio file uploaded successfully",
  "audio": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalName": "my-audio.mp3",
    "filename": "550e8400-e29b-41d4-a716-446655440000-1234567890.mp3",
    "path": "uploads/550e8400-e29b-41d4-a716-446655440000-1234567890.mp3",
    "size": 5242880,
    "mimetype": "audio/mpeg",
    "uploadedAt": "2024-01-15T10:30:00.000Z",
    "duration": null,
    "format": ".mp3",
    "owner": {
      "name": "John",
      "surname": "Doe"
    }
  }
}
```

#### Error Response (400 Bad Request)

```json
{
  "error": "No audio file provided"
}
```

#### Error Response (500 Internal Server Error)

```json
{
  "error": "Failed to upload audio file"
}
```

---

## Examples

### cURL

#### Basic Upload

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "audio=@/path/to/your/audio.mp3"
```

#### Upload with Owner Information

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "audio=@/path/to/your/audio.mp3" \
  -F "name=John" \
  -F "surname=Doe"
```

#### Upload with Custom Headers

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@/path/to/your/audio.wav"
```

#### Upload with Progress

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "audio=@/path/to/your/audio.mp3" \
  --progress-bar
```

### JavaScript (Fetch API)

#### Basic Upload

```javascript
const formData = new FormData();
formData.append('audio', audioFile);

fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => {
    console.log('Upload successful:', data);
  })
  .catch(error => {
    console.error('Upload failed:', error);
  });
```

#### Upload with Owner Information

```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('name', 'John');
formData.append('surname', 'Doe');

fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => {
    console.log('Upload successful:', data);
  })
  .catch(error => {
    console.error('Upload failed:', error);
  });
```

#### Upload with Progress Tracking

```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const xhr = new XMLHttpRequest();

xhr.upload.addEventListener('progress', (e) => {
  if (e.lengthComputable) {
    const percentComplete = (e.loaded / e.total) * 100;
    console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
  }
});

xhr.addEventListener('load', () => {
  if (xhr.status === 200) {
    const response = JSON.parse(xhr.responseText);
    console.log('Upload successful:', response);
  } else {
    console.error('Upload failed:', xhr.statusText);
  }
});

xhr.open('POST', 'http://localhost:3000/api/upload');
xhr.send(formData);
```

#### Upload with Async/Await

```javascript
async function uploadAudio(file, name = '', surname = '') {
  try {
    const formData = new FormData();
    formData.append('audio', file);
    if (name) formData.append('name', name);
    if (surname) formData.append('surname', surname);

    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Usage
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const result = await uploadAudio(file, 'John', 'Doe');
      console.log('Audio ID:', result.audio.id);
    } catch (error) {
      console.error('Failed to upload:', error);
    }
  }
});
```

### Python (Requests)

#### Basic Upload

```python
import requests

url = 'http://localhost:3000/api/upload'

with open('audio.mp3', 'rb') as audio_file:
    files = {'audio': audio_file}
    response = requests.post(url, files=files)
    
    if response.status_code == 200:
        data = response.json()
        print('Upload successful:', data)
    else:
        print('Upload failed:', response.text)
```

#### Upload with Owner Information

```python
import requests

url = 'http://localhost:3000/api/upload'

with open('audio.mp3', 'rb') as audio_file:
    files = {'audio': audio_file}
    data = {
        'name': 'John',
        'surname': 'Doe'
    }
    response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        data = response.json()
        print('Upload successful:', data)
    else:
        print('Upload failed:', response.text)
```

#### Upload with Progress

```python
import requests
from requests_toolbelt.multipart.encoder import MultipartEncoder
from requests_toolbelt import MultipartEncoderMonitor

def create_callback(encoder):
    encoder_len = len(encoder)
    def callback(monitor):
        progress = (monitor.bytes_read / encoder_len) * 100
        print(f'Upload progress: {progress:.2f}%')
    return callback

url = 'http://localhost:3000/api/upload'

with open('audio.mp3', 'rb') as audio_file:
    encoder = MultipartEncoder(
        fields={'audio': ('audio.mp3', audio_file, 'audio/mpeg')}
    )
    
    monitor = MultipartEncoderMonitor(encoder, create_callback(encoder))
    
    response = requests.post(
        url,
        data=monitor,
        headers={'Content-Type': monitor.content_type}
    )
    
    if response.status_code == 200:
        print('Upload successful:', response.json())
    else:
        print('Upload failed:', response.text)
```

### Node.js (Axios)

#### Basic Upload

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('audio', fs.createReadStream('audio.mp3'));

axios.post('http://localhost:3000/api/upload', formData, {
  headers: formData.getHeaders()
})
  .then(response => {
    console.log('Upload successful:', response.data);
  })
  .catch(error => {
    console.error('Upload failed:', error.response?.data || error.message);
  });
```

#### Upload with Owner Information

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('audio', fs.createReadStream('audio.mp3'));
formData.append('name', 'John');
formData.append('surname', 'Doe');

axios.post('http://localhost:3000/api/upload', formData, {
  headers: formData.getHeaders()
})
  .then(response => {
    console.log('Upload successful:', response.data);
  })
  .catch(error => {
    console.error('Upload failed:', error.response?.data || error.message);
  });
```

#### Upload with Progress

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('audio', fs.createReadStream('audio.mp3'));

axios.post('http://localhost:3000/api/upload', formData, {
  headers: formData.getHeaders(),
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    console.log(`Upload progress: ${percentCompleted}%`);
  }
})
  .then(response => {
    console.log('Upload successful:', response.data);
  })
  .catch(error => {
    console.error('Upload failed:', error.response?.data || error.message);
  });
```

### Postman

1. **Method:** Select `POST`
2. **URL:** `http://localhost:3000/api/upload`
3. **Body Tab:**
   - Select `form-data`
   - Add a key named `audio`
   - Change the type from "Text" to "File" (using the dropdown)
   - Click "Select Files" and choose your audio file
   - (Optional) Add a key named `name` with value (e.g., "John")
   - (Optional) Add a key named `surname` with value (e.g., "Doe")
4. **Send:** Click the "Send" button

### PowerShell

#### Basic Upload

```powershell
$filePath = "C:\path\to\audio.mp3"
$uri = "http://localhost:3000/api/upload"

$form = @{
    audio = Get-Item -Path $filePath
}

$response = Invoke-RestMethod -Uri $uri -Method Post -Form $form
$response | ConvertTo-Json
```

#### Upload with Owner Information

```powershell
$filePath = "C:\path\to\audio.mp3"
$uri = "http://localhost:3000/api/upload"

$form = @{
    audio = Get-Item -Path $filePath
    name = "John"
    surname = "Doe"
}

$response = Invoke-RestMethod -Uri $uri -Method Post -Form $form
$response | ConvertTo-Json
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the upload was successful |
| `message` | string | Success message |
| `audio.id` | string | Unique identifier for the audio file (UUID) |
| `audio.originalName` | string | Original filename of the uploaded file |
| `audio.filename` | string | Server-generated filename |
| `audio.path` | string | Server file path |
| `audio.size` | number | File size in bytes |
| `audio.mimetype` | string | MIME type of the file |
| `audio.uploadedAt` | string | ISO 8601 timestamp of upload |
| `audio.duration` | null | Audio duration (currently null, can be extended) |
| `audio.format` | string | File extension (e.g., ".mp3") |
| `audio.owner.name` | string | Owner's first name (optional) |
| `audio.owner.surname` | string | Owner's surname (optional) |

---

## Error Handling

### Common Errors

1. **No file provided**
   - **Status:** 400 Bad Request
   - **Message:** "No audio file provided"
   - **Solution:** Ensure the form field is named `audio` and contains a file

2. **Invalid file type**
   - **Status:** 400 Bad Request
   - **Message:** "Only audio files are allowed!"
   - **Solution:** Upload a supported audio format (MP3, WAV, OGG, M4A, AAC, FLAC, WEBM)

3. **File too large**
   - **Status:** 400 Bad Request
   - **Message:** "File too large"
   - **Solution:** Ensure file size is under 100 MB

4. **Server error**
   - **Status:** 500 Internal Server Error
   - **Message:** "Failed to upload audio file"
   - **Solution:** Check server logs and ensure uploads directory has write permissions

---

## Best Practices

1. **Always check the response status** before assuming success
2. **Handle errors gracefully** with appropriate user feedback
3. **Show upload progress** for large files to improve user experience
4. **Validate file type and size** on the client side before uploading
5. **Store the returned audio ID** for future API calls (retrieval, deletion, etc.)
6. **Use HTTPS in production** to secure file uploads

---

## Related Endpoints

After uploading, you can use these endpoints:

- **Get all audio files:** `GET /api/audio`
- **Get single audio file:** `GET /api/audio/:id`
- **Stream audio file:** `GET /api/audio/:id/stream`
- **Delete audio file:** `DELETE /api/audio/:id`

See the main README.md for complete API documentation.
