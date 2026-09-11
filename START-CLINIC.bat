@echo off
setlocal
set /p MYSQL_PASSWORD=Enter MySQL root password: 
if "%MYSQL_PASSWORD%"=="" (
  echo MySQL password cannot be empty.
  pause
  exit /b 1
)
call mvn clean test
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)
mvn spring-boot:run
endlocal
