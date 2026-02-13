#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000"
USER_EMAIL="admin@notaria.com"
USER_PASS="admin123"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "--- Starting Phase 8: Simulation Test ---"

# 1. Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASS\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Login failed${NC}"
  echo $LOGIN_RESPONSE
  exit 1
fi
echo -e "${GREEN}Login successful${NC}"

# 2. Create Vendor (Clean)
echo "2. Creating Clean Vendor..."
VENDOR_RES=$(curl -s -X POST "$BASE_URL/api/debida-diligencia" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipoPersona": "NATURAL",
    "nombres": "Juan",
    "apellidos": "Perez Clean",
    "identificacion": "1710001000",
    "email": "juan@clean.com",
    "telefono": "0999999999",
    "direccion": "Calle Clean 123",
    "estadoCivil": "SOLTERO",
    "esPEP": false
  }')

VENDOR_ID=$(echo $VENDOR_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$VENDOR_ID" ]; then
  # Check if it exists
  VENDOR_ID=$(echo $VENDOR_RES | grep -o '"personaId":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$VENDOR_ID" ]; then
  echo -e "${RED}Failed to create/find Vendor${NC}"
  echo $VENDOR_RES
  exit 1
fi
echo "Vendor ID: $VENDOR_ID"

# 3. Create Buyer (Sanctioned)
echo "3. Creating Sanctioned Buyer (Trigger: SANCTION)..."
BUYER_RES=$(curl -s -X POST "$BASE_URL/api/debida-diligencia" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipoPersona": "NATURAL",
    "nombres": "Pedro",
    "apellidos": "Sanction Target",
    "identificacion": "1720002000",
    "email": "pedro@sanction.com",
    "telefono": "0988888888",
    "direccion": "Calle Sanction 666",
    "estadoCivil": "CASADO",
    "esPEP": false
  }')

BUYER_ID=$(echo $BUYER_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$BUYER_ID" ]; then
  # Check if it exists
  BUYER_ID=$(echo $BUYER_RES | grep -o '"personaId":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$BUYER_ID" ]; then
  echo -e "${RED}Failed to create/find Buyer${NC}"
  echo $BUYER_RES
  exit 1
fi
echo "Buyer ID: $BUYER_ID"

# 4. Verify Lists
echo "4. Verifying Lists (Calling Simulation)..."
VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/verificar-listas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"vendedorId\":\"$VENDOR_ID\",\"compradorId\":\"$BUYER_ID\"}")

echo "Response: $VERIFY_RESPONSE"

# Check Results
if echo "$VERIFY_RESPONSE" | grep -q '"globalStatus":"MATCH"'; then
   echo -e "${GREEN}SUCCESS: Simulation detected MATCH correctly.${NC}"
else
   echo -e "${RED}FAILURE: Simulation did not detect match.${NC}"
fi

if echo "$VERIFY_RESPONSE" | grep -q '"source":"OFAC"'; then
   echo -e "${GREEN}SUCCESS: Source OFAC identified.${NC}"
else
   echo -e "${RED}FAILURE: Source OFAC not found.${NC}"
fi
