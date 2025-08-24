#!/bin/bash

# go to the script directory (project root)
cd "$(dirname "$0")"

echo "🚀 Starting Backend..."
cd backend
npm start &
BACK_PID=$!

echo "🚀 Starting Frontend..."
cd ../frontend/frontend
npm run dev &
FRONT_PID=$!

# Wait so that if you Ctrl+C, it kills both
trap "kill $BACK_PID $FRONT_PID" SIGINT
wait
