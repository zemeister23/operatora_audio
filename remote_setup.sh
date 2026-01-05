#!/bin/bash
# Remote setup script for Operatora Audio

REMOTE_DIR="~/operatora_audio"
cd $REMOTE_DIR

echo "========================================"
echo "Setting up Operatora Audio"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "Node.js installed: $(node --version)"
else
    echo "Node.js already installed: $(node --version)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Installing npm..."
    sudo apt-get install -y npm
    echo "npm installed: $(npm --version)"
else
    echo "npm already installed: $(npm --version)"
fi

# Install project dependencies
echo ""
echo "Installing project dependencies..."
npm install

# Make scripts executable
chmod +x upload.sh deploy.sh 2>/dev/null || true

echo ""
echo "========================================"
echo "Setup completed!"
echo "========================================"
echo ""
echo "To start the server:"
echo "  cd $REMOTE_DIR"
echo "  npm start"
echo ""
echo "Or run in background:"
echo "  nohup npm start > server.log 2>&1 &"
echo ""
