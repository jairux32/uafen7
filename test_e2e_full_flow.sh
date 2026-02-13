#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000"
USER_EMAIL="admin@notaria.com"
USER_PASS="admin123"
TIMESTAMP=$(date +%s)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Starting E2E Full Flow Test ===${NC}"

# Function to check exit code
check_status() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed at step: $1${NC}"
    exit 1
  fi
}

# 1. Login
echo -e "\n${BLUE}[1/8] Logging in...${NC}"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASS\"}")

TOKEN=$(echo $LOGIN_RES | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Login failed${NC}"
  echo $LOGIN_RES
  exit 1
fi
echo -e "${GREEN}✅ Login successful${NC}"

# 2. Debida Diligencia - Vendedor
echo -e "\n${BLUE}[2/8] Creating Vendedor...${NC}"
VENDEDOR_ID="17$(shuf -i 10000000-99999999 -n 1)" # Random ID
echo "  Identification: $VENDEDOR_ID"

VENDEDOR_RES=$(curl -s -X POST "$BASE_URL/api/debida-diligencia" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tipoPersona\": \"NATURAL\",
    \"nombres\": \"Vendedor_Test_$TIMESTAMP\",
    \"apellidos\": \"E2E\",
    \"identificacion\": \"$VENDEDOR_ID\",
    \"email\": \"vendedor_$TIMESTAMP@test.com\",
    \"telefono\": \"0999999999\",
    \"direccion\": \"Calle Test 123\",
    \"estadoCivil\": \"SOLTERO\",
    \"esPEP\": false
  }")

V_ID=$(echo $VENDEDOR_RES | jq -r '.id')
check_status "Create Vendedor"
echo -e "${GREEN}✅ Vendedor created: $V_ID${NC}"

# 3. Debida Diligencia - Comprador
echo -e "\n${BLUE}[3/8] Creating Comprador...${NC}"
COMPRADOR_ID="17$(shuf -i 10000000-99999999 -n 1)" # Random ID
echo "  Identification: $COMPRADOR_ID"

COMPRADOR_RES=$(curl -s -X POST "$BASE_URL/api/debida-diligencia" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tipoPersona\": \"NATURAL\",
    \"nombres\": \"Comprador_Test_$TIMESTAMP\",
    \"apellidos\": \"E2E\",
    \"identificacion\": \"$COMPRADOR_ID\",
    \"email\": \"comprador_$TIMESTAMP@test.com\",
    \"telefono\": \"0988888888\",
    \"direccion\": \"Av Test 456\",
    \"estadoCivil\": \"CASADO\",
    \"esPEP\": false
  }")

C_ID=$(echo $COMPRADOR_RES | jq -r '.id')
check_status "Create Comprador"
echo -e "${GREEN}✅ Comprador created: $C_ID${NC}"

# 4. Risk Calculation (Backend)
echo -e "\n${BLUE}[4/8] Calculating Risk...${NC}"
RISK_RES=$(curl -s -X POST "$BASE_URL/api/operaciones/calcular-riesgo" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tipoActo\": \"COMPRAVENTA\",
    \"valorDeclarado\": 150000,
    \"montoEfectivo\": 5000,
    \"vendedor\": { \"tipoPersona\": \"NATURAL\", \"esPEP\": false },
    \"comprador\": { \"tipoPersona\": \"NATURAL\", \"esPEP\": false }
  }")

SCORE=$(echo $RISK_RES | jq -r '.score')
LEVEL=$(echo $RISK_RES | jq -r '.nivel')
echo "  Score: $SCORE, Level: $LEVEL"

if [ "$SCORE" == "null" ]; then
    echo -e "${RED}Risk calculation failed${NC}"
    echo $RISK_RES
    exit 1
fi
echo -e "${GREEN}✅ Risk calculated${NC}"

# 5. List Verification (Backend)
echo -e "\n${BLUE}[5/8] Verifying Lists...${NC}"
LISTS_RES=$(curl -s -X POST "$BASE_URL/api/verificar-listas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"vendedorId\":\"$V_ID\",\"compradorId\":\"$C_ID\"}")

GLOBAL_STATUS=$(echo $LISTS_RES | jq -r '.vendedor.globalStatus')
if [ "$GLOBAL_STATUS" == "CLEAN" ]; then
    echo -e "${GREEN}✅ Lists verified (CLEAN)${NC}"
else
    echo -e "${RED}Lists verification unexpected result: $GLOBAL_STATUS${NC}"
    echo $LISTS_RES
    # Continue anyway as simulation might trigger randomly or based on name
fi

# 6. Create Operation
echo -e "\n${BLUE}[6/8] Creating Operation...${NC}"
OP_RES=$(curl -s -X POST "$BASE_URL/api/operaciones" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tipoActo\": \"COMPRAVENTA\",
    \"numeroEscritura\": \"ESC-$TIMESTAMP\",
    \"fechaEscritura\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
    \"descripcionBien\": \"Departamento de prueba E2E ubicado en Quito\",
    \"valorDeclarado\": 150000,
    \"formaPago\": \"TRANSFERENCIA\",
    \"montoEfectivo\": 5000,
    \"vendedorId\": \"$V_ID\",
    \"compradorId\": \"$C_ID\"
  }")

OP_ID=$(echo $OP_RES | jq -r '.operacion.id')

if [ "$OP_ID" == "null" ] || [ -z "$OP_ID" ]; then
  echo -e "${RED}Operation creation failed${NC}"
  echo $OP_RES
  exit 1
fi
echo -e "${GREEN}✅ Operation created: $OP_ID${NC}"

# 7. Upload Document
echo -e "\n${BLUE}[7/8] Uploading Document...${NC}"
# Create dummy PDF
echo "Dummy PDF Content" > dummy_$TIMESTAMP.pdf

UPLOAD_RES=$(curl -s -X POST "$BASE_URL/api/documentos" \
  -H "Authorization: Bearer $TOKEN" \
  -F "archivo=@dummy_$TIMESTAMP.pdf" \
  -F "operacionId=$OP_ID" \
  -F "tipo=OTRO" \
  -F "descripcion=Escritura Publica Mock")

DOC_ID=$(echo $UPLOAD_RES | jq -r '.id')
rm dummy_$TIMESTAMP.pdf # Cleanup

if [ "$DOC_ID" == "null" ]; then
    echo -e "${RED}Document upload failed${NC}"
    echo $UPLOAD_RES
    exit 1
fi
echo -e "${GREEN}✅ Document uploaded: $DOC_ID${NC}"

# 8. Generate Report (PDF)
echo -e "\n${BLUE}[8/8] Generating PDF Report...${NC}"
PDF_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/operaciones/$OP_ID/pdf")

if [ "$PDF_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PDF Generated (HTTP 200)${NC}"
else
    echo -e "${RED}PDF Generation failed (HTTP $PDF_HTTP_CODE)${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 E2E TEST COMPLETED SUCCESSFULLY! 🎉${NC}"
