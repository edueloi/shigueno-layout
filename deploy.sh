#!/bin/bash
# =============================================================================
# deploy.sh — Página Shigueno (shigueno-layout)
# Uso primeiro deploy:  bash deploy.sh --setup
# Uso atualização:      bash deploy.sh
# =============================================================================

set -e
APP_DIR="/var/www/pagina-shigueno"
APP_NAME="pagina-shigueno"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✔] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
fail() { echo -e "${RED}[✗] $1${NC}"; exit 1; }

if [[ "$1" == "--setup" ]]; then
  warn "Modo SETUP — configuração inicial"

  # Clonar repositório
  mkdir -p /var/www
  cd /var/www
  git clone https://github.com/edueloi/shigueno-layout.git $APP_DIR \
    || fail "Erro ao clonar repositório."

  cd $APP_DIR

  # Copiar .env se não existe
  if [ ! -f ".env" ]; then
    warn "Criando .env de produção..."
    cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=3008
DB_HOST=localhost
DB_USER=root
DB_PASS=Edu@06051992
DB_NAME=shigueno_data
GEMINI_API_KEY=
RH_VISION_URL=http://localhost:3021
SHIGUENO_WEBHOOK_SECRET=shigueno-webhook-2026
APP_URL=https://pagina-teste.develoi.com.br
ENVEOF
    warn "EDITE o .env e preencha o GEMINI_API_KEY: nano $APP_DIR/.env"
  fi

  mkdir -p $APP_DIR/uploads
  mkdir -p /var/log/pm2

  # Nginx
  log "Configurando nginx..."
  cp $APP_DIR/nginx.conf /etc/nginx/sites-available/$APP_NAME
  ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
  nginx -t && systemctl reload nginx

  log "Setup concluído! Execute:  bash deploy.sh"
  exit 0
fi

# =============================================================================
# DEPLOY / ATUALIZAÇÃO
# =============================================================================
log "Iniciando deploy do $APP_NAME..."
cd $APP_DIR

log "Atualizando código..."
git pull

log "Instalando dependências..."
npm install --legacy-peer-deps

log "Rodando migrations (cria/atualiza banco shigueno_data)..."
node migrate.cjs

log "Compilando (vite build + esbuild server)..."
npm run build

log "Reiniciando PM2..."
if pm2 list | grep -q "$APP_NAME"; then
  pm2 restart $APP_NAME --update-env
else
  pm2 start ecosystem.config.cjs
  pm2 save
fi

log "Deploy concluído! ✔"
echo ""
echo "  Logs:   pm2 logs $APP_NAME --lines 50"
echo "  URL:    https://pagina-teste.develoi.com.br"
