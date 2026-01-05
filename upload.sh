#!/bin/bash

# Audio Upload Script for Linux
URI="http://localhost:3000/api/upload"
AUDIO_PATH="./sample.mp3"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Check if file exists
if [ ! -f "$AUDIO_PATH" ]; then
    echo -e "${RED}ERROR: Audio file not found at: $AUDIO_PATH${NC}"
    exit 1
fi

echo -e "${CYAN}========================================${NC}"
echo -e "${YELLOW}Uploading audio file...${NC}"
echo -e "${WHITE}File: $AUDIO_PATH${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}ERROR: curl is not installed. Please install curl first.${NC}"
    exit 1
fi

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq is not installed. JSON output will be raw.${NC}"
    USE_JQ=false
else
    USE_JQ=true
fi

# Upload file
echo -e "${WHITE}Executing curl command...${NC}"
echo ""

RESPONSE=$(curl -s -S -X POST "$URI" \
    -F "audio=@$AUDIO_PATH" \
    -F "name=John" \
    -F "surname=Doe" \
    2>&1)

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS] Upload completed!${NC}"
    echo ""
    echo -e "${CYAN}Response:${NC}"
    
    if [ "$USE_JQ" = true ]; then
        echo "$RESPONSE" | jq .
        echo ""
        echo -e "${CYAN}Audio Details:${NC}"
        echo -e "${WHITE}  ID: $(echo "$RESPONSE" | jq -r '.audio.id')${NC}"
        echo -e "${WHITE}  Original Name: $(echo "$RESPONSE" | jq -r '.audio.originalName')${NC}"
        echo -e "${WHITE}  Owner: $(echo "$RESPONSE" | jq -r '.audio.owner.name') $(echo "$RESPONSE" | jq -r '.audio.owner.surname')${NC}"
        
        SIZE_BYTES=$(echo "$RESPONSE" | jq -r '.audio.size')
        SIZE_MB=$(echo "scale=2; $SIZE_BYTES / 1024 / 1024" | bc)
        echo -e "${WHITE}  Size: ${SIZE_MB} MB${NC}"
        echo -e "${WHITE}  Format: $(echo "$RESPONSE" | jq -r '.audio.format')${NC}"
        echo -e "${WHITE}  Uploaded At: $(echo "$RESPONSE" | jq -r '.audio.uploadedAt')${NC}"
    else
        echo "$RESPONSE"
    fi
    
    echo ""
    echo -e "${CYAN}========================================${NC}"
else
    echo ""
    echo -e "${RED}[ERROR] Upload failed!${NC}"
    echo -e "${RED}Error: $RESPONSE${NC}"
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Alternative: Make sure server is running with 'npm start'${NC}"
    exit 1
fi
