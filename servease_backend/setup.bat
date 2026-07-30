@echo off
echo Setting up ServEase database...

REM Delete existing database
if exist db.sqlite3 (
    del db.sqlite3
    echo Deleted old database
)

REM Create migrations
echo Creating migrations...
python manage.py makemigrations

REM Apply migrations
echo Applying migrations...
python manage.py migrate

REM Create superuser
echo.
echo Creating superuser...
python manage.py createsuperuser

echo.
echo Setup complete!
echo Run: python manage.py runserver
pause