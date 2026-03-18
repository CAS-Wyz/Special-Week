#!/bin/bash
set -e

echo "🚀 Déploiement en cours..."

echo "📦 Build des images Docker..."
docker build -t specialweekacr.azurecr.io/backend:latest ./Backend
docker build -t specialweekacr.azurecr.io/frontend:latest "./Site Web"

echo "📤 Push vers Azure Container Registry..."
az acr login --name specialweekacr
docker push specialweekacr.azurecr.io/backend:latest
docker push specialweekacr.azurecr.io/frontend:latest

echo "🔄 Redémarrage des App Services..."
az webapp restart --name special-week-backend --resource-group special-week-rg
az webapp restart --name special-week-frontend --resource-group special-week-rg

echo "✅ Déploiement terminé !"
echo "🌐 Frontend : https://special-week-frontend.azurewebsites.net"
echo "🔧 Backend  : https://special-week-backend.azurewebsites.net"
