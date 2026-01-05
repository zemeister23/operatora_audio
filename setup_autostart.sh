#!/bin/bash

# Script to set up automatic startup for Operatora Audio Server

echo "Operatora Audio Server - Auto-start setup"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "This script needs sudo privileges to install systemd service."
    echo "Please run: sudo $0"
    exit 1
fi

SERVICE_FILE="operatora-audio.service"
SERVICE_PATH="/etc/systemd/system/$SERVICE_FILE"
CURRENT_DIR=$(pwd)

echo ""
echo "Installing systemd service..."
echo "Service file: $SERVICE_FILE"
echo "Target location: $SERVICE_PATH"

# Copy service file
cp "$CURRENT_DIR/$SERVICE_FILE" "$SERVICE_PATH"

# Reload systemd
echo ""
echo "Reloading systemd daemon..."
systemctl daemon-reload

# Enable service to start on boot
echo ""
echo "Enabling service to start on boot..."
systemctl enable $SERVICE_FILE

# Start the service
echo ""
echo "Starting service..."
systemctl start $SERVICE_FILE

# Check status
echo ""
echo "Service status:"
systemctl status $SERVICE_FILE --no-pager

echo ""
echo "=========================================="
echo "Setup complete!"
echo ""
echo "Useful commands:"
echo "  Check status:  sudo systemctl status operatora-audio"
echo "  Start:         sudo systemctl start operatora-audio"
echo "  Stop:          sudo systemctl stop operatora-audio"
echo "  Restart:       sudo systemctl restart operatora-audio"
echo "  View logs:     sudo journalctl -u operatora-audio -f"
echo "  Disable:       sudo systemctl disable operatora-audio"
echo ""
