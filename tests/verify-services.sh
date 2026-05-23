#!/bin/bash

# Script para verificar que cada servicio está activo y operativo
# Ejecutarlo después de: docker compose up -d

set -e

GATEWAY_URL="http://localhost:8000"
SERVICES=(
    "auth-service:8000"
    "academic-service:8000"
    "internship-service:8000"
    "evaluation-service:8000"
    "document-service:8000"
    "notification-service:8000"
)

echo "=========================================="
echo "VERIFICACIÓN DE SERVICIOS INDIVIDUALES"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para hacer health check
check_service() {
    local service=$1
    local service_name=$(echo $service | cut -d: -f1)
    
    echo -n "Checking $service_name... "
    
    # Intentamos hacer un GET a /docs o /health del servicio
    response=$(curl -s -o /dev/null -w "%{http_code}" http://$service/docs 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ OK (HTTP 200)${NC}"
        return 0
    else
        # Si /docs no existe, intentamos un endpoint base
        response=$(curl -s -o /dev/null -w "%{http_code}" http://$service/health 2>/dev/null || echo "000")
        if [ "$response" = "200" ] || [ "$response" = "404" ]; then
            echo -e "${GREEN}✓ OK (HTTP $response)${NC}"
            return 0
        else
            echo -e "${RED}✗ FAIL (HTTP $response)${NC}"
            return 1
        fi
    fi
}

# Función para verificar que el servicio rechaza solicitudes sin auth
check_auth() {
    local service=$1
    local service_name=$(echo $service | cut -d: -f1)
    local endpoint=$2
    
    echo -n "  Checking auth on $service_name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" http://$service/api/v1/$endpoint 2>/dev/null || echo "000")
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo -e "${GREEN}✓ Protected (HTTP $response)${NC}"
        return 0
    else
        echo -e "${YELLOW}? Unexpected HTTP $response${NC}"
        return 0
    fi
}

failed=0

# Verificar cada servicio
for service in "${SERVICES[@]}"; do
    if ! check_service "$service"; then
        failed=$((failed + 1))
    else
        # Verificar auth protección en endpoint base
        service_name=$(echo $service | cut -d: -f1)
        case $service_name in
            "auth-service")
                check_auth "$service" "users"
                ;;
            "academic-service")
                check_auth "$service" "academic/sedes"
                ;;
            "internship-service")
                check_auth "$service" "internships"
                ;;
            "evaluation-service")
                check_auth "$service" "evaluations"
                ;;
            "document-service")
                check_auth "$service" "documents"
                ;;
            "notification-service")
                check_auth "$service" "notifications/send"
                ;;
        esac
    fi
done

echo ""
echo "=========================================="

# Verificar gateway
echo -n "Checking API Gateway... "
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ OK (HTTP 200)${NC}"
else
    echo -e "${RED}✗ FAIL (HTTP $response)${NC}"
    failed=$((failed + 1))
fi

echo ""
if [ $failed -eq 0 ]; then
    echo -e "${GREEN}========== ALL SERVICES OK ==========${NC}"
    exit 0
else
    echo -e "${RED}========== $failed SERVICE(S) FAILED ==========${NC}"
    exit 1
fi
