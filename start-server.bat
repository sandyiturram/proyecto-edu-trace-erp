@echo off
echo =============================================
echo   EDU-TRACE ERP - Servidor Local
echo =============================================
echo.
echo Iniciando servidor en http://localhost:8080
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

REM Intentar con Python 3
python -m http.server 8080 2>nul
if %errorlevel% neq 0 (
    REM Intentar con Python 2
    python -m SimpleHTTPServer 8080 2>nul
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Python no esta instalado.
        echo.
        echo Opciones para ejecutar el servidor:
        echo.
        echo 1. Instalar Python desde https://www.python.org/downloads/
        echo 2. Usar Node.js: npm install -g http-server ^&^& http-server -p 8080
        echo 3. Usar la extension Live Server de VS Code
        echo.
        pause
    )
)
