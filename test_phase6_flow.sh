#!/bin/bash

# Configuration
API_URL="http://localhost:3000/api"
EMAIL="admin@notaria.com"
PASSWORD="admin123"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Starting Phase 6 Functional Test ===${NC}"

# 1. Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Login failed${NC}"
  exit 1
fi
echo -e "${GREEN}Login successful. Token acquired.${NC}"

# 2. Get Existing Operation ID (or utilize the one from previous tests)
echo "2. Fetching latest operation for detail view..."
OPERACIONES_RESPONSE=$(curl -s -X GET "${API_URL}/operaciones?limit=1" \
  -H "Authorization: Bearer $TOKEN")

OPERACION_ID=$(echo $OPERACIONES_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$OPERACION_ID" ]; then
  echo -e "${RED}No operations found. Please run api_test_flow.sh first to seed data.${NC}"
  exit 1
fi
echo -e "${GREEN}Found Operacion ID: $OPERACION_ID${NC}"

# 3. Verify Detail Endpoint
echo "3. Verifying Detail Endpoint (GET /api/operaciones/$OPERACION_ID)..."
DETAIL_RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${API_URL}/operaciones/${OPERACION_ID}" \
  -H "Authorization: Bearer $TOKEN")

if [ "$DETAIL_RESPONSE_CODE" -eq 200 ]; then
  echo -e "${GREEN}Detail endpoint responding correctly (200 OK)${NC}"
else
  echo -e "${RED}Detail endpoint failed with code $DETAIL_RESPONSE_CODE${NC}"
  exit 1
fi

# 4. Verify PDF Download
echo "4. Testing PDF Generation (GET /api/operaciones/$OPERACION_ID/pdf)..."
curl -s -X GET "${API_URL}/operaciones/${OPERACION_ID}/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -o test_report.pdf \
  -w "%{http_code}" > status.txt

STATUS=$(cat status.txt)
rm status.txt

if [ "$STATUS" -eq 200 ]; then
  FILE_TYPE=$(file -b --mime-type test_report.pdf)
  echo "Downloaded file type: $FILE_TYPE"
  if [[ "$FILE_TYPE" == "application/pdf" ]]; then
     echo -e "${GREEN}PDF downloaded and verified successfully!${NC}"
     rm test_report.pdf
  else
     echo -e "${RED}Downloaded file is NOT a valid PDF${NC}"
     exit 1
  fi
else
  echo -e "${RED}PDF download failed (Status $STATUS)${NC}"
  exit 1
fi

echo -e "${GREEN}=== All Phase 6 Tests Passed Successfully ===${NC}"
