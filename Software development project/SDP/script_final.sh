#!/bin/bash

cd "$(dirname "$0")"

# ============================================
# Pretty Startup Logo
# ============================================

clear
CYAN='\033[0;36m'
NC='\033[0m'

LOGO="
████████╗     █████╗
╚══██╔══╝    ██╔══██╗
   ██║       ███████║ made by:Theekshana Fernando
   ██║       ██╔══██║
   ██║       ██║  ██║
   ╚═╝       ╚═╝  ╚═╝
   T.A ENTERPRISES
"

echo -e "${CYAN}"
while IFS= read -r line; do
  echo "$line"
  sleep 0.2
done <<< "$LOGO"
echo -e "${NC}"

sleep 3

# ============================================
# Start XAMPP with root permissions
# ============================================

echo "⚡ Starting XAMPP (MySQL + Apache)..."
sudo /Applications/XAMPP/xamppfiles/xampp startmysql
sudo /Applications/XAMPP/xamppfiles/xampp startapache

# ============================================
# Kill port 8085 if already in use
# ============================================

echo "🔎 Checking if port 8085 is in use..."
PID=$(lsof -ti:8085)

if [ -n "$PID" ]; then
  echo "⚠️ Port 8085 is busy (PID: $PID). Killing..."
  kill -9 $PID
  echo "✅ Freed port 8085."
else
  echo "✅ Port 8085 is free."
fi

# ============================================
# Start Backend
# ============================================

echo "🚀 Starting Backend..."
cd backend
npm start &
BACK_PID=$!

# ============================================
# Start Frontend
# ============================================

echo "🚀 Starting Frontend..."
cd ../frontend/frontend
npm run dev &
FRONT_PID=$!

# ============================================
# Cleanup on exit
# ============================================

trap "kill $BACK_PID $FRONT_PID" SIGINT
wait
