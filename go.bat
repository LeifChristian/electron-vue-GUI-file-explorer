@echo off
echo Deleting files...
del /q /s .\dist\assets\*.*
echo Files deleted successfully.
echo Running script...
npm run go
echo Script executed successfully.
pause
