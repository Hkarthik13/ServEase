# ServEase

ServEase is a full-stack local home services marketplace for booking verified providers such as electricians, plumbers, cleaners, painters, and AC technicians. It includes a Next.js frontend, Django REST backend, role-based dashboards, service discovery, booking flow, payments and wallet support, AI-assisted service recommendations, and CI/CD checks.

## Tech Stack

### Backend

- Django 5
- Django REST Framework
- SimpleJWT authentication
- SQLite for local development, MySQL-ready configuration for production
- Redis and Celery support
- Razorpay and Stripe payment integrations
- Cloudinary media storage
- Firebase and Twilio integrations

### Frontend

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Framer Motion and GSAP
- React Query
- React Hook Form
- React Leaflet
- Recharts
- Lucide React

## Project Structure

```text
ServEase/
|-- servease_backend/       # Django REST backend
|   |-- apps/               # Domain apps
|   |-- config/             # Django settings and URLs
|   |-- manage.py
|   `-- requirements.txt
|-- servease_frontend/      # Next.js frontend
|   |-- app/                # App Router pages
|   |-- components/         # Shared UI components
|   |-- lib/                # API and auth helpers
|   |-- package.json
|   `-- package-lock.json
|-- static/                 # Django static source directory
|-- docker-compose.yml
`-- README.md
```

## Backend Setup

```bash
cd servease_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend API runs at:

```text
http://localhost:8000/api
```

## Frontend Setup

```bash
cd servease_frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

## Docker Setup

```bash
docker-compose up -d
```

Services:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- Django Admin: `http://localhost:8000/admin`

## CI Checks

GitHub Actions runs separate checks for frontend and backend:

- Frontend: `npm ci`, `npm run lint`, `npm run build`
- Backend: `pip install -r requirements.txt`, `python manage.py check`, `python manage.py test`

## Key Features

- Customer, provider, and admin roles
- Service browsing and filtering
- Booking management
- Provider profiles and availability
- Payments and wallet support
- Reviews and ratings
- Notifications and support tickets
- Analytics dashboards
- AI-assisted service recommendations

## Notes

- `Pillow` is required because the backend uses Django `ImageField`.
- The `static/` directory is tracked so Django `STATICFILES_DIRS` is valid in CI.
