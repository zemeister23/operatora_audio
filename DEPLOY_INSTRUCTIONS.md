# Deployment Instructions - Operatora Audio

## Server Information
- **Host:** 192.168.1.94
- **User:** operatora_audio
- **Password:** Ops2332@
- **Remote Directory:** ~/operatora_audio

## Quick Deploy (Recommended)

### Step 1: Upload Files

**Option A: Using WinSCP (Windows)**
1. Download and install WinSCP
2. Connect to: `operatora_audio@192.168.1.94`
3. Password: `Ops2332@`
4. Upload all project files to: `~/operatora_audio/`

**Option B: Using SCP (Command Line)**
```bash
scp -r * operatora_audio@192.168.1.94:~/operatora_audio/
```

### Step 2: SSH to Server and Setup

```bash
ssh operatora_audio@192.168.1.94
cd ~/operatora_audio
bash remote_setup.sh
```

### Step 3: Start Server

```bash
npm start
```

Or run in background:
```bash
nohup npm start > server.log 2>&1 &
```

## Files to Upload

Required files:
- `server.js`
- `package.json`
- `package-lock.json` (if exists)
- `README.md`
- `API_DOCUMENTATION.md`
- `.gitignore`
- `upload.sh`
- `remote_setup.sh`
- `public/` (entire directory)

## Using upload.sh Script

After deployment, you can use `upload.sh` to upload audio files:

```bash
# Edit upload.sh and change AUDIO_PATH to your audio file
nano upload.sh

# Make it executable (if not already)
chmod +x upload.sh

# Run it
./upload.sh
```

## Troubleshooting

### Server not accessible
- Check network connection
- Verify IP address: `192.168.1.94`
- Check firewall settings

### Node.js installation fails
- Run manually: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -`
- Then: `sudo apt-get install -y nodejs`

### Port 3000 already in use
- Change port in `server.js`: `const PORT = process.env.PORT || 3001;`
- Or kill existing process: `lsof -ti:3000 | xargs kill`

### Permission denied
- Make scripts executable: `chmod +x upload.sh remote_setup.sh`
- Check file permissions: `ls -la`

## Access Dashboard

After server starts, access dashboard at:
- Local: `http://localhost:3000`
- Remote: `http://192.168.1.94:3000`

## API Endpoint

API base URL:
- `http://192.168.1.94:3000/api`

Example upload:
```bash
curl -X POST http://192.168.1.94:3000/api/upload \
  -F "audio=@sample.mp3" \
  -F "name=John" \
  -F "surname=Doe"
```
