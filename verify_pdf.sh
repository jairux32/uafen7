#!/bin/bash

# Configuration
API_URL="http://localhost:3000/api"
EMAIL="admin@notaria.com"
PASSWORD="admin123"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting PDF Verification...${NC}"

# 1. Login
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Login failed${NC}"
  echo $LOGIN_RESPONSE
  exit 1
fi
echo -e "${GREEN}Login successful${NC}"

# 2. Get Operations to find an ID
echo "Fetching operations..."
OPERACIONES_RESPONSE=$(curl -s -X GET "${API_URL}/operaciones?limit=1" \
  -H "Authorization: Bearer $TOKEN")

OPERACION_ID=$(echo $OPERACIONES_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$OPERACION_ID" ]; then
  echo -e "${RED}No operations found${NC}"
  echo $OPERACIONES_RESPONSE
  exit 1
fi
echo -e "${GREEN}Found Operacion ID: $OPERACION_ID${NC}"

# 3. Download PDF
echo "Downloading PDF..."
curl -s -X GET "${API_URL}/operaciones/${OPERACION_ID}/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -o report.pdf \
  -w "%{http_code}" > status.txt

STATUS=$(cat status.txt)
rm status.txt

if [ "$STATUS" -eq 200 ]; then
  echo -e "${GREEN}PDF downloaded successfully (Status 200)${NC}"
  
  # Check file magic number (PDF should start with %PDF)
  file_type=$(file -b --mime-type report.pdf)
  echo "File type: $file_type"
  if [[ "$file_type" == "application/pdf" ]]; then
     echo -e "${GREEN}File valid PDF${NC}"
  else
     echo -e "${RED}File is not a valid PDF${NC}"
  fi
else
  echo -e "${RED}Failed to download PDF (Status $STATUS)${NC}"
  cat report.pdf
  exit 1
fi
