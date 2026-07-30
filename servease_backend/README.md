# ServEase Backend

Book Trusted Home Services in Minutes

## Tech Stack

- **Django 5** - Web framework
- **Django REST Framework** - API development
- **MySQL** - Primary database
- **Redis + Celery** - Background tasks & caching
- **JWT Authentication** - Token-based auth
- **SimpleJWT** - JWT implementation

## Project Structure

```
servease_backend/
├── config/              # Django settings & configuration
├── apps/
│   ├── authentication/  # Login, Signup, OTP, Password reset
│   ├── users/           # User profiles, Addresses
│   ├── providers/       # Provider profiles, Documents, Availability
│   ├── categories/      # Service categories
│   ├── services/        # Services & features
│   ├── bookings/        # Booking engine & scheduling
│   ├── payments/        # Payments, Wallet, Coupons
│   ├── reviews/         # Ratings & reviews
│   ├── notifications/   # Email, SMS, Push notifications
│   ├── support/         # Support tickets, FAQ, Chatbot
│   ├── analytics/       # Statistics & tracking
│   ├── adminpanel/      # Admin dashboard
│   └── core/            # Activity logs, utilities
├── media/               # User uploaded files
├── static/              # Static files
└── templates/           # HTML templates
```

## Installation

### Windows Users
If you encounter `mysqlclient` or `Pillow` installation errors on Windows:

1. **Install Visual Studio Build Tools** (if needed)
   - Download from: https://visualstudio.microsoft.com/downloads/
   - Install "Desktop development with C++" workload

2. **Or use alternative approach:**
```bash
# The requirements.txt now uses pymysql instead of mysqlclient
# Just run:
pip install -r requirements.txt
```

### Linux/Mac Users
```bash
# Install system dependencies first (Ubuntu/Debian)
sudo apt-get install python3-dev default-libmysqlclient-dev pkg-config libjpeg-dev zlib1g-dev

# Then install Python packages
pip install -r requirements.txt
```

1. **Clone the repository**
```bash
git clone <repository-url>
cd servease_backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

4. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

5. **Setup MySQL database**
```sql
CREATE DATABASE servease_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

6. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **Create superuser**
```bash
python manage.py createsuperuser
```

8. **Start Redis** (required for Celery)
```bash
redis-server
```

9. **Run development server**
```bash
python manage.py runserver
```

10. **Start Celery worker** (in separate terminal)
```bash
celery -A config worker --loglevel=info
```

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/otp/send/` - Send OTP
- `POST /api/auth/otp/verify/` - Verify OTP
- `POST /api/auth/forgot-password/` - Request password reset
- `POST /api/auth/reset-password/` - Reset password
- `GET /api/auth/profile/` - Get user profile

### Users
- `GET /api/users/profile/` - Get profile
- `GET /api/users/addresses/` - List addresses
- `POST /api/users/addresses/` - Add address
- `PUT /api/users/addresses/<id>/` - Update address
- `DELETE /api/users/addresses/<id>/` - Delete address

### Categories
- `GET /api/categories/` - List categories
- `GET /api/categories/<slug>/` - Category detail

### Services
- `GET /api/services/` - List services
- `GET /api/services/<id>/` - Service detail
- `POST /api/services/` - Create service (Provider)
- `PUT /api/services/<id>/` - Update service (Provider)

### Bookings
- `GET /api/bookings/` - List bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/<id>/` - Booking detail
- `PUT /api/bookings/<id>/` - Update booking
- `POST /api/bookings/<id>/cancel/` - Cancel booking

### Payments
- `POST /api/payments/initiate/` - Initiate payment
- `POST /api/payments/verify/` - Verify payment
- `GET /api/payments/` - List payments

### Reviews
- `GET /api/reviews/` - List reviews
- `POST /api/reviews/` - Create review
- `GET /api/reviews/<id>/` - Review detail

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/<id>/read/` - Mark as read

### Support
- `GET /api/support/tickets/` - List tickets
- `POST /api/support/tickets/` - Create ticket
- `GET /api/support/tickets/<id>/` - Ticket detail

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DJANGO_SECRET_KEY` - Django secret key
- `DB_NAME, DB_USER, DB_PASSWORD` - MySQL credentials
- `REDIS_URL` - Redis connection URL
- `RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET` - Razorpay credentials
- `STRIPE_SECRET_KEY` - Stripe credentials
- `CLOUDINARY_*` - Cloudinary for file storage

## Features

- ✅ JWT Authentication
- ✅ Role-based access (Customer, Provider, Admin)
- ✅ Service booking with real-time availability
- ✅ Provider verification system
- ✅ Payment integration (Razorpay/Stripe)
- ✅ Review & rating system
- ✅ Notification system (Email, SMS, Push)
- ✅ Wallet & coupon system
- ✅ Support ticket system
- ✅ Analytics & reporting
- ✅ Activity logging
- ✅ File uploads (Cloudinary)

## Development

Run tests:
```bash
python manage.py test
```

Format code:
```bash
black .
```

Check for issues:
```bash
flake8
```

## License

MIT License