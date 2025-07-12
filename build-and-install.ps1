# Tetris VSCode Extension - Build and Install Script
# テトリス拡張機能の自動ビルド・インストールスクリプト

# Set UTF-8 encoding for console output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🎮 Tetris VSCode Extension - Auto Build & Install" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Step 1: Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path "*.vsix") {
    Remove-Item -Force "*.vsix"
}

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 3: Compile the extension
Write-Host "🔨 Compiling extension..." -ForegroundColor Yellow
npm run compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed" -ForegroundColor Red
    exit 1
}

# Step 4: Run tests (if available)
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
# npm test  # Uncomment if you want to run tests

# Step 5: Package the extension
Write-Host "📦 Packaging extension..." -ForegroundColor Yellow
npx @vscode/vsce package --out "yuruteto-latest.vsix" --skip-license
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Packaging failed" -ForegroundColor Red
    exit 1
}

# Step 6: Install the extension
Write-Host "🚀 Installing extension..." -ForegroundColor Yellow
code --install-extension "yuruteto-latest.vsix" --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Installation failed" -ForegroundColor Red
    exit 1
}

# Step 7: Success message
Write-Host "✅ Success! Tetris extension has been built and installed!" -ForegroundColor Green
Write-Host "🎮 How to play:" -ForegroundColor Cyan
Write-Host "   1. Press Ctrl+Shift+P to open command palette" -ForegroundColor White
Write-Host "   2. Type 'Start Tetris Game' and press Enter" -ForegroundColor White
Write-Host "   3. Enjoy playing Tetris in VS Code!" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Game Controls:" -ForegroundColor Cyan
Write-Host "   ← → : Move pieces" -ForegroundColor White
Write-Host "   ↑   : Rotate piece" -ForegroundColor White
Write-Host "   ↓   : Soft drop" -ForegroundColor White
Write-Host "   Space: Hard drop" -ForegroundColor White
Write-Host "   P   : Pause game" -ForegroundColor White
Write-Host ""
Write-Host "🎵 BGM Controls:" -ForegroundColor Cyan
Write-Host "   🎵 Play/⏸️ Pause: BGM control" -ForegroundColor White
Write-Host "   ⏹️ Stop: Stop BGM" -ForegroundColor White
Write-Host "   Volume: Adjust sound level" -ForegroundColor White

# Optional: Open VS Code to test
$openVSCode = Read-Host "Open VS Code to test the extension? (y/n)"
if ($openVSCode -eq "y" -or $openVSCode -eq "Y") {
    code .
}
