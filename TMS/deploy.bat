@echo on
set target="\\192.168.0.230\wwwroot\app\tms\jollyb"
xcopy /y/e/s www %target%\www
pause 
copy /y index.html %target%
copy /y update.json %target%
copy /y TMS.apk %target%\TMS.apk
del TMS.apk /f /q
pause 