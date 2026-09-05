#!/bin/bash
echo "========================================"
echo " DeepGuard - Starting MERN Website on macOS"
echo "========================================"
echo

# Get the script's directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Starting Node.js Backend API (Port 5001)..."
cd "$DIR/api"
npm install
npm run dev &
API_PID=$!

echo "Starting React Frontend Website (Port 1573)..."
cd "$DIR/web"
npm install
npm run dev &
WEB_PID=$!

echo
echo "Both servers are starting in the background!"
echo "Node Backend API PID: $API_PID (Port 5001)"
echo "React Frontend PID: $WEB_PID (Port 1573)"
echo
echo "Press Ctrl+C to stop both servers."

# Keep running and trap SIGINT to kill background processes on exit
trap "kill $API_PID $WEB_PID; exit" INT
wait
