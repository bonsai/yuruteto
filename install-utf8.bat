echo off
chcp 65001 >nul 2>&1
echo 🎮 Tetris VSCode Extension - Auto Build ^& Install
echo =================================================

echo 🧹 Cleaning previous builds...
if exist "dist" rmdir /s /q "dist"
if exist "*.vsix" del /q "*.vsix"

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo 🔨 Compiling extension...
call npm run compile
if errorlevel 1 (
    echo ❌ Compilation failed
    exit /b 1
)

echo 📦 Packaging extension...
call npx @vscode/vsce package --out "yuruteto-latest.vsix" --skip-license
if errorlevel 1 (
    echo ❌ Packaging failed
    exit /b 1
)

echo 🚀 Installing extension...
call code --install-extension "yuruteto-latest.vsix" --force
if errorlevel 1 (
    echo ❌ Installation failed
    exit /b 1
)

echo ✅ Success! Tetris extension has been built and installed!
echo.
echo 🎮 How to play:
echo    1. Press Ctrl+Shift+P to open command palette
echo    2. Type 'Start Tetris Game' and press Enter
echo    3. Enjoy playing Tetris in VS Code!
echo.
echo 🎯 Game Controls:
echo    ← → : Move pieces
echo    ↑   : Rotate piece
echo    ↓   : Soft drop
echo    Space: Hard drop
echo    P   : Pause game
echo.
echo 🎵 BGM Controls:
echo    🎵 Play/⏸️ Pause: BGM control
echo    ⏹️ Stop: Stop BGM
echo    Volume: Adjust sound level

set /p openVSCode="Open VS Code to test the extension? (y/n): "
if /i "%openVSCode%"=="y" code .

pause
