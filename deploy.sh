#!/bin/bash

# Google Cloud Deployment Script
# Despliega Backend y Frontend a Cloud Run

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID="noble-return-447622-s1"  # ⚠️ REEMPLAZA CON TU PROJECT ID
REGION="southamerica-east1"
BACKEND_SERVICE="inventario-api"
FRONTEND_SERVICE="inventario-frontend"

echo -e "${YELLOW}🚀 Iniciando deployment a Google Cloud...${NC}"

# 1. Autenticación
echo -e "${YELLOW}📝 Configurando proyecto...${NC}"
gcloud config set project $PROJECT_ID

# 2. Habilitar APIs necesarias
echo -e "${YELLOW}🔧 Habilitando APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 3. Build Backend
echo -e "${YELLOW}🔨 Compilando Backend...${NC}"
gcloud builds submit \
  --region=$REGION \
  --config=cloudbuild-backend.yaml \
  --substitutions="_REGION=$REGION,_SERVICE=$BACKEND_SERVICE"

# 4. Build Frontend
echo -e "${YELLOW}🔨 Compilando Frontend...${NC}"
gcloud builds submit \
  --region=$REGION \
  --config=cloudbuild-frontend.yaml \
  --substitutions="_REGION=$REGION,_SERVICE=$FRONTEND_SERVICE"

echo -e "${GREEN}✅ Deployment completado!${NC}"
echo -e "${GREEN}Backend: https://$BACKEND_SERVICE-$REGION.a.run.app${NC}"
echo -e "${GREEN}Frontend: https://$FRONTEND_SERVICE-$REGION.a.run.app${NC}"
