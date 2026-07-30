# ServEase - Home Services Marketplace

**Book Trusted Home Services in Minutes**

A full-stack on-demand home services marketplace platform built with Django 5 and Next.js 14.

## 🏗️ Architecture

### Backend (Django 5)
- **Framework**: Django 5 + Django REST Framework
- **Database**: MySQL with ACID transactions
- **Cache**: Redis for caching and Celery for async tasks
- **Authentication**: JWT with SimpleJWT
- **Payments**: Razorpay & Stripe integration
- **Storage**: Cloudinary for media files

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom theme
- **Animations**: Framer Motion & GSAP
- **Icons**: Lucide React
- **State**: React Query & Context API

## 📁 Project Structure

```
ServEase/
├── servease_backend/           # Django Backend
│   ├── config/                 # Settings & configuration
│   ├── apps/                   # Django applications
│   │   ├── authentication/     # Login, Signup, OTP
│   │   ├── users/              # User profiles & addresses
│   │   ├── providers/          # Provider management
│   │   ├── categories/         # Service categories
│   │   ├── services/           # Services & features
│   │   ├── bookings/           # Booking engine
│   │   ├── payments/           # Payments, Wallet, Coupons
│   │   ├── reviews/            # Ratings & reviews
│   │   ├── notifications/      # Email, SMS, Push
│   │   ├── support/            # Tickets, FAQ, Chatbot
│   │   ├── analytics/          # Statistics & tracking
│   │   ├── adminpanel/         # Admin dashboard
│   │   └── core/               # Activity logs
│   ├── media/                  # Uploaded files
│   ├── static/                 # Static assets
│   ├── templates/              # HTML templates
│   ├── Dockerfile              # Backend Docker config
│   └── requirements.txt        # Python dependencies
│
├── servease_frontend/          # Next.js Frontend
│   ├── app/                    # App Router pages
│   │   ├── auth/               # Authentication pages
│   │   │   ├── signup/
│   │   │   ├── login/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── dashboard/          # Customer dashboard
│   │   ├── services/           # Service listings
│   │   ├── bookings/           # Booking management
│   │   ├── provider/           # Provider dashboard
│   │   ├── admin/              # Admin dashboard
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css          # Global styles
│   ├── components/             # Reusable components
│   ├── lib/                    # Utilities & API
│   ├── public/                 # Static assets
│   ├── Dockerfile              # Frontend Docker config
│   ├── next.config.js          # Next.js config
│   ├── tailwind.config.js      # Tailwind config
│   ├── tsconfig.json           # TypeScript config
│   └── package.json            # Node dependencies
│
├── docker-compose.yml          # Docker orchestration
└── README.md                   # This file
```

## 🎨 Design System

### Colors
- **Primary**: Royal Blue (#2563EB)
- **Secondary**: Slate Black (#0F172A)
- **Accent**: Teal (#14B8A6)
- **Background**: Light Gray (#F8FAFC)
- **Cards**: White (#FFFFFF)

### Typography
- **Headings**: Poppins (400, 500, 600, 700, 800)
- **Body**: Inter (300, 400, 500, 600, 700)

### Key Features
- Glassmorphism cards
- Gradient buttons (Blue → Cyan)
- Smooth animations & transitions
- Responsive design (Mobile, Tablet, Desktop)
- Rounded corners (16-20px)
- Soft shadows

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Redis 7+
- Docker & Docker Compose (optional)

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd ServEase
```

2. **Setup virtual environment**
```bash
cd servease_backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Setup database**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE servease_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run migrations
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

5. **Start Redis**
```bash
redis-server
```

6. **Run development server**
```bash
python manage.py runserver
```

7. **Start Celery worker** (separate terminal)
```bash
celery -A config worker --loglevel=info
```

### Frontend Setup

1. **Install dependencies**
```bash
cd servease_frontend
npm install
```

2. **Setup environment**
```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

3. **Run development server**
```bash
npm run dev
```

4. **Open browser**
```
http://localhost:3000
```

### Docker Setup (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

## 📊 Database Schema

### Core Tables
- **users** - User accounts (Customer, Provider, Admin)
- **providers** - Service provider profiles
- **categories** - Service categories
- **services** - Service offerings
- **bookings** - Booking records
- **payments** - Payment transactions
- **reviews** - Customer reviews & ratings
- **notifications** - In-app notifications
- **support_tickets** - Customer support
- **addresses** - User saved addresses
- **wallet** - User wallets for refunds
- **coupons** - Discount coupons

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup/` - Register new user
- `POST /api/auth/login/` - User login (JWT)
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/otp/send/` - Send OTP
- `POST /api/auth/otp/verify/` - Verify OTP
- `POST /api/auth/forgot-password/` - Request password reset
- `POST /api/auth/reset-password/` - Reset password

### Services
- `GET /api/categories/` - List categories
- `GET /api/services/` - List services
- `GET /api/services/<id>/` - Service detail
- `POST /api/services/` - Create service (Provider)

### Bookings
- `GET /api/bookings/` - List bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/<id>/` - Booking detail
- `POST /api/bookings/<id>/cancel/` - Cancel booking
- `PUT /api/bookings/<id>/status/` - Update status (Provider)

### Payments
- `POST /api/payments/initiate/` - Initiate payment
- `POST /api/payments/verify/` - Verify payment webhook
- `GET /api/payments/` - List payments

### Reviews
- `GET /api/reviews/` - List reviews
- `POST /api/reviews/` - Create review
- `POST /api/reviews/<id>/helpful/` - Mark as helpful

## 👥 User Roles

### Customer
- Browse services & categories
- Search & filter providers
- Book services
- Make payments
- Leave reviews
- Manage addresses
- Track bookings

### Provider
- Create service listings
- Set availability
- Accept/reject bookings
- Update booking status
- View earnings & analytics
- Manage portfolio

### Admin
- Verify providers
- Manage users & services
- View analytics & reports
- Handle support tickets
- Manage coupons & promotions
- Access audit logs

## ✨ Key Features

### For Customers
- 🔍 Smart search with filters
- 📍 Location-based services
- 💳 Multiple payment options (UPI, Cards, Net Banking)
- 📱 Real-time booking tracking
- ⭐ Review & rating system
- 💰 Wallet & cashbacks
- 🎫 Support tickets
- 🔔 Push/Email/SMS notifications

### For Providers
- 📅 Calendar management
- 📊 Earnings analytics
- ✅ Document verification
- 🕐 Availability scheduling
- 💬 Customer communication
- 📈 Performance metrics

### For Admins
- 📊 Advanced analytics dashboard
- 👥 User management
- ✅ Provider verification
- 💰 Revenue tracking
- 🎫 Support ticket management
- 📄 CRM & reporting

## 🎯 Future Enhancements

- [ ] Voice booking integration
- [ ] WhatsApp booking
- [ ] Subscription plans
- [ ] Membership & loyalty programs
- [ ] Multi-language support
- [ ] Dark mode
- [ ] AI-powered service recommendations
- [ ] Emergency booking
- [ ] Recurring bookings
- [ ] Video consultation

## 🛠️ Tech Stack Details

### Backend
- **Django 5** - Web framework
- **Django REST Framework** - REST API
- **MySQL 8.0** - Primary database
- **Redis 7** - Caching & broker
- **Celery** - Async task queue
- **SimpleJWT** - JWT authentication
- **Razorpay/Stripe** - Payment gateways
- **Cloudinary** - File storage
- **Firebase** - Push notifications
- **Twilio** - SMS notifications

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Framer Motion** - Animations
- **GSAP** - Advanced animations
- **Lucide React** - Icon library
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization
- **React Leaflet** - Maps

## 📦 Deployment

### Production Checklist
- [ ] Set `DEBUG=False` in Django settings
- [ ] Configure allowed hosts
- [ ] Setup SSL certificates
- [ ] Configure environment variables
- [ ] Setup database backups
- [ ] Configure logging
- [ ] Setup monitoring (Sentry)
- [ ] Enable CDN for static files
- [ ] Configure email service
- [ ] Setup payment webhooks

### Environment Variables
See `.env.example` files in both backend and frontend directories.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@servease.com or create an issue in the repository.

---

Built with ❤️ by the ServEase Team