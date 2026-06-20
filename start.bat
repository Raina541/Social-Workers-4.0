@echo off
set "nodeDir=C:\Users\nilap\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.16.0-win-x64"
set "PATH=%nodeDir%;%PATH%"
echo Starting Expo Metro Bundler...
npx expo start
