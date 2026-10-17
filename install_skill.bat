@echo off
setlocal
if "%1"=="" goto list
if "%1"=="list" goto list
if "%1"=="search" goto search
if "%1"=="add" goto add

:help
echo Agentic Awesome Skills Manager for Antigravity
echo.
echo Usage:
echo   install_skill.bat list               - List installed skills
echo   install_skill.bat search ^<keyword^>   - Search catalog of 2,700+ skills
echo   install_skill.bat add ^<skill-name^>   - Add skill to .agents\skills
goto end

:list
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install_skill.ps1" -Action list
goto end

:search
if "%2"=="" (
    echo Please provide a keyword to search. Example: install_skill.bat search fastapi
    goto end
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install_skill.ps1" -Action search -Query "%2"
goto end

:add
if "%2"=="" (
    echo Please provide a skill name. Example: install_skill.bat add fastapi-pro
    goto end
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install_skill.ps1" -Action add -Query "%2"
goto end

:end
endlocal
