@echo off
echo Cleaning up for fresh migration...

REM Delete SQLite database
if exist db.sqlite3 (
    del db.sqlite3
    echo Deleted db.sqlite3
)

REM Delete all __pycache__ folders
for /d /r . %%d in (__pycache__) do (
    if exist "%%d" (
        rd /s /q "%%d"
        echo Deleted __pycache__ in %%d
    )
)

REM Delete migration files (except __init__.py in migrations folders)
echo Deleting migration files...
for /d /r . %%d in (migrations) do (
    if exist "%%d" (
        cd "%%d"
        del /q *.py 2>nul
        cd..
    )
)

echo.
echo Cleanup complete! Now run:
echo python manage.py migrate
echo python manage.py createsuperuser

pause