#!/bin/bash

# Script para verificar que cada servicio está activo (ejecutado dentro del gateway)

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "VERIFICACIÓN DE SERVICIOS INTERNOS"
echo "=========================================="
echo ""

# Array de servicios internos
declare -A SERVICES=(
    ["auth-service"]="auth-service:8000"
    ["academic-service"]="academic-service:8000"
    ["internship-service"]="internship-service:8000"
    ["evaluation-service"]="evaluation-service:8000"
    ["document-service"]="document-service:8000"
    ["notification-service"]="notification-service:8000"
)

failed=0

for name in "${!SERVICES[@]}"; do
    url=${SERVICES[$name]}
    echo -n "Testing $name... "
    
    # Intentar GET a /docs
    response=$(timeout 3 curl -s -o /dev/null -w "%{http_code}" http://$url/docs 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        # Si /docs no funciona, intentar /health o simplemente conectar
        response=$(timeout 3 curl -s -o /dev/null -w "%{http_code}" http://$url/ 2>/dev/null || echo "000")
        if [ "$response" != "000" ] && [ "$response" != "000000" ]; then
            echo -e "${GREEN}✓ OK (HTTP $response)${NC}"
        else
            echo -e "${RED}✗ FAIL${NC}"
            failed=$((failed + 1))
        fi
    fi
done

echo ""
echo "=========================================="

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}ALL SERVICES RESPONDING${NC}"
    exit 0
else
    echo -e "${RED}$failed SERVICE(S) NOT RESPONDING${NC}"
    exit 1
fi
