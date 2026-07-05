@echo off
start "Server" cmd /k "cd server && npm run dev"
start "Client" cmd /k "cd client && npm start"
timeout /t 5 /nobreak >nul
start http://localhost:3000