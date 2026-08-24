Write-Host "Redemarrage du serveur adb..." -ForegroundColor Cyan
& "C:\Users\TENGO\AppData\Local\Android\Sdk\platform-tools\adb.exe" kill-server
& "C:\Users\TENGO\AppData\Local\Android\Sdk\platform-tools\adb.exe" start-server

Write-Host "Verification des appareils connectes..." -ForegroundColor Cyan
& "C:\Users\TENGO\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices

Write-Host "Lancement d'Expo..." -ForegroundColor Green
npx expo start --clear
