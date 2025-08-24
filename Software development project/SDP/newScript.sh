#!/bin/bash

cd "$(dirname "$0")"

# Clear screen
clear

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Banner (using figlet-style font look)
LOGO="
████████╗     █████╗
╚══██╔══╝    ██╔══██╗
   ██║       ███████║
   ██║       ██╔══██║
   ██║       ██║  ██║
   ╚═╝       ╚═╝  ╚═╝
   T.A ENTERPRISES
"

# Animate printing one line at a time
echo -e "${CYAN}"
while IFS= read -r line; do
  echo "$line"
  sleep 0.2
done <<< "$LOGO"
echo -e "${NC}"

# Pause 3 seconds before continuing
sleep 3

# ============================
# Start your actual services
# ============================

echo "⚡ Starting XAMPP (MySQL + Apache)..."
/Applications/XAMPP/xamppfiles/xampp startmysql
/Applications/XAMPP/xamppfiles/xampp startapache

echo "🚀 Starting Backend..."
cd backend
npm start &
BACK_PID=$!

echo "🚀 Starting Frontend..."
cd ../frontend/frontend
npm run dev &
FRONT_PID=$!

# Handle cleanup when you stop
trap "kill $BACK_PID $FRONT_PID" SIGINT
wait
