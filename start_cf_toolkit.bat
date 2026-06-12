@echo off

tasklist | findstr pythonw.exe >nul

if %errorlevel%==0 (
    exit
)

cd /d C:\Users\shahj\Projects\codeForcesTabOpener

start "" pythonw server.py

exit