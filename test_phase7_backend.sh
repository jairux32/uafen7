#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="http://localhost:3000/api"
TEST_FILE="test_document.pdf"

echo "=== Starting Phase 7 Backend Verification ==="

# 0. Create dummy PDF
echo "Test PDF Content" > $TEST_FILE

# 1. Login
echo -n "1. Logging in... "
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@notaria.com", "password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}FAILED${NC}"
  echo "Response: $LOGIN_RESPONSE"
  rm $TEST_FILE
  exit 1
fi
echo -e "${GREEN}OK${NC}"

# 2. Upload Document
# We need an existing Operacion ID. Let's fetch the first one.
echo -n "2. Fetching Operation ID... "
OPS_RESPONSE=$(curl -s -X GET "${API_URL}/operaciones?limit=1" -H "Authorization: Bearer $TOKEN")
OP_ID=$(echo $OPS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$OP_ID" ]; then
    echo -e "${RED}FAILED (No operations found)${NC}"
    rm $TEST_FILE
    exit 1
fi
echo -e "${GREEN}OK (ID: $OP_ID)${NC}"

echo -n "3. Uploading Document... "
UPLOAD_RESPONSE=$(curl -s -X POST "${API_URL}/documentos" \
  -H "Authorization: Bearer $TOKEN" \
  -F "archivo=@$TEST_FILE;type=application/pdf" \
  -F "operacionId=$OP_ID" \
  -F "tipo=OTRO" \
  -F "descripcion=Test Document Upload")

DOC_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$DOC_ID" ]; then
    echo -e "${RED}FAILED${NC}"
    echo "Response: $UPLOAD_RESPONSE"
    rm $TEST_FILE
    exit 1
fi
echo -e "${GREEN}OK (Doc ID: $DOC_ID)${NC}"

# 3. List Documents
echo -n "4. Listing Documents... "
LIST_RESPONSE=$(curl -s -X GET "${API_URL}/documentos/operacion/$OP_ID" -H "Authorization: Bearer $TOKEN")

if echo "$LIST_RESPONSE" | grep -q "$DOC_ID"; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED (Doc not found in list)${NC}"
    echo "Response: $LIST_RESPONSE"
    rm $TEST_FILE
    exit 1
fi

# 4. Delete Document
echo -n "5. Deleting Document... "
DELETE_RESPONSE=$(curl -s -X DELETE "${API_URL}/documentos/$DOC_ID" -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_RESPONSE" | grep -q "eliminado correctamente"; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "Response: $DELETE_RESPONSE"
    rm $TEST_FILE
    exit 1
fi

# Cleanup
rm $TEST_FILE
echo "=== Phase 7 Backend Verification Complete ==="
