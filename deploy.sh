#!/bin/bash

# Deploy script for Operatora Audio to Linux server
SERVER_USER="operatora_audio"
SERVER_HOST="192.168.1.94"
SERVER_PASS="Ops2332@"
REMOTE_DIR="~/operatora_audio"
LOCAL_DIR="."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Deploying Operatora Audio to Linux${NC}"
echo -e "${CYAN}Server: $SERVER_USER@$SERVER_HOST${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}sshpass is not installed. Installing...${NC}"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y sshpass
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        echo -e "${RED}Please install sshpass manually${NC}"
        exit 1
    fi
fi

# Create remote directory
echo -e "${YELLOW}Creating remote directory...${NC}"
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "mkdir -p $REMOTE_DIR"

# Copy files (excluding node_modules, uploads, data)
echo -e "${YELLOW}Copying files to server...${NC}"
sshpass -p "$SERVER_PASS" rsync -avz --exclude 'node_modules' --exclude 'uploads' --exclude 'data' --exclude '.git' \
    "$LOCAL_DIR/" "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR/"

# Install dependencies and setup on remote server
echo -e "${YELLOW}Setting up on remote server...${NC}"
sshpass -p "$SERVER_PASS" ssh "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
cd ~/operatora_audio

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Installing npm..."
    sudo apt-get install -y npm
fi

# Install project dependencies
echo "Installing dependencies..."
npm install

# Make upload.sh executable
chmod +x upload.sh

echo "Setup completed!"
echo ""
echo "To start the server, run:"
echo "  cd ~/operatora_audio"
echo "  npm start"
echo ""
echo "Or run in background:"
echo "  nohup npm start > server.log 2>&1 &"
ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}To connect to server:${NC}"
echo -e "${WHITE}  ssh $SERVER_USER@$SERVER_HOST${NC}"
echo ""
echo -e "${CYAN}To start the server:${NC}"
echo -e "${WHITE}  ssh $SERVER_USER@$SERVER_HOST 'cd ~/operatora_audio && npm start'${NC}"
echo ""
