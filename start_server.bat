@echo off
color 0A
title FiveM Resource Checker

echo ===================================================
echo           FiveM Resource Checker
echo ===================================================
echo.

REM Prüfen, ob Node.js installiert ist
echo Prüfe Node.js Installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [FEHLER] Node.js ist nicht installiert!
    echo Bitte installiere Node.js von https://nodejs.org/
    echo.
    pause
    exit /b
)
echo [OK] Node.js gefunden.

REM Prüfen, ob die Abhängigkeiten installiert sind
if not exist node_modules (
    echo [INFO] Abhängigkeiten werden installiert...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [FEHLER] Fehler beim Installieren der Abhängigkeiten!
        echo Versuche es erneut oder installiere manuell mit 'npm install'.
        pause
        exit /b
    )
    echo [OK] Abhängigkeiten erfolgreich installiert.
    echo.
) else (
    echo [OK] Abhängigkeiten bereits installiert.
)

REM Prüfen, ob socket.io installiert ist (häufiges Problem)
echo Prüfe wichtige Abhängigkeiten...
if not exist node_modules\socket.io (
    echo [INFO] Socket.io wird installiert...
    call npm install socket.io --save
    if %errorlevel% neq 0 (
        color 0C
        echo [FEHLER] Fehler beim Installieren von Socket.io!
        pause
        exit /b
    )
    echo [OK] Socket.io erfolgreich installiert.
) else (
    echo [OK] Socket.io ist installiert.
)

REM Server starten
echo.
echo ===================================================
echo [INFO] Server wird gestartet...
echo [INFO] Der Browser sollte sich automatisch öffnen.
echo [INFO] Wenn nicht, öffne http://localhost:3000 in deinem Browser.
echo [INFO] Drücke Strg+C, um den Server zu beenden.
echo ===================================================
echo.

REM Starte den Server und öffne den Browser
timeout /t 2 >nul
start http://localhost:3000
node server.js