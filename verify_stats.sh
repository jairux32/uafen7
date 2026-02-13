#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api"

# 1. Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@notaria.com", "password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}Login successful${NC}"

# 2. Get Stats
echo "2. Testing Gets Stats (GET /api/operaciones/stats)..."
STATS_RESPONSE=$(curl -s -X GET "${API_URL}/operaciones/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Stats Response: $STATS_RESPONSE"

if echo "$STATS_RESPONSE" | grep -q "total"; then
  echo -e "${GREEN}Stats endpoint working!${NC}"
else
  echo -e "${RED}Stats endpoint failed${NC}"
  exit 1
fi
