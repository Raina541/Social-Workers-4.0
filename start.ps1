Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
$nodeDir = 'C:\Users\nilap\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.16.0-win-x64'
$env:PATH = "$nodeDir;$env:PATH"
Write-Host "Starting Expo Metro Bundler..." -ForegroundColor Green
npx expo start
