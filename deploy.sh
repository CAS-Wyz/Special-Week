#!/bin/bash
set -e

echo "🚀 Déploiement en cours..."

TAG=$(date +%Y%m%d%H%M%S)
echo "🏷️  Tag : $TAG"

echo "📦 Build des images Docker..."
docker build -t specialweekacr.azurecr.io/backend:$TAG -t specialweekacr.azurecr.io/backend:latest ./Backend
docker build -t specialweekacr.azurecr.io/frontend:$TAG -t specialweekacr.azurecr.io/frontend:latest "./Site Web"

echo "📤 Push vers Azure Container Registry..."
az acr login --name specialweekacr
docker push specialweekacr.azurecr.io/backend:$TAG
docker push specialweekacr.azurecr.io/frontend:$TAG

echo "🔄 Mise à jour des App Services avec le nouveau tag $TAG..."
az webapp config container set \
  --name special-week-backend \
  --resource-group special-week-rg \
  --docker-custom-image-name specialweekacr.azurecr.io/backend:$TAG

az webapp config container set \
  --name special-week-frontend \
  --resource-group special-week-rg \
  --docker-custom-image-name specialweekacr.azurecr.io/frontend:$TAG

echo "✅ Déploiement terminé !"
echo "🌐 Frontend : https://special-week-frontend.azurewebsites.net"
echo "🔧 Backend  : https://special-week-backend.azurewebsites.net"
