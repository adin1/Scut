#!/usr/bin/env bash
# ==============================================================================
# Script de automatizare pentru distribuire pe Firebase App Distribution
# Proiect: scut-1c5ea (SCUT Platform)
# ==============================================================================

set -e

echo "🔒 Verificare configurare Firebase..."

PROJECT_ID="scut-1c5ea"
GROUPS="internal-testers"

echo "🔨 Compilare proiect SCUT..."
npm run build

echo "📦 Pregătire pachet de distribuție..."
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
RELEASE_NOTES="Build SCUT actualizat la data de $TIMESTAMP"

if command -v firebase &> /dev/null; then
  echo "🚀 Lansare distribuție către grupul '$GROUPS'..."
  # Execuție comandă distribuire
  npx firebase-tools appdistribution:distribute dist \
    --project "$PROJECT_ID" \
    --groups "$GROUPS" \
    --release-notes "$RELEASE_NOTES" || echo "ℹ️ Asigurați-vă că sunteți autentificat prin 'npx firebase login'."
else
  echo "ℹ️ Se rulează prin npx firebase-tools..."
  npx firebase-tools appdistribution:distribute dist \
    --project "$PROJECT_ID" \
    --groups "$GROUPS" \
    --release-notes "$RELEASE_NOTES" || echo "ℹ️ Rulați 'npx firebase login' pentru autorizare."
fi

echo "✅ Script finalizat!"
