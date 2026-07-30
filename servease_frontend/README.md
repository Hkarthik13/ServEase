# ServEase Frontend

Premium Next.js frontend for ServEase - Home Services Marketplace

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Query** - Data fetching & caching
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Recharts** - Charts & analytics
- **React Leaflet** - Maps

## Project Structure

```
servease_frontend/
├── app/
│   ├── auth/
│   │   ├── signup/
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── dashboard/
│   ├── services/
│   ├── bookings/
│   ├── provider/
│   │   └── dashboard/
│   ├── admin/
│   │   └── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── forms/
│   ├── layout/
│   └── animations/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
├── public/
│   ├── images/
│   └── icons/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Color Theme

- **Primary**: Royal Blue (#2563EB)
- **Secondary**: Slate Black (#0F172A)
- **Accent**: Teal (#14B8A6)
- **Gradient**: Blue → Cyan

## Typography

- **Headings**: Poppins
- **Body**: Inter

## Installation

1. **Install dependencies**
```bash
npm install
# or
yarn install
```

2. **Setup environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

3. **Run development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm run start
```

## Features

- ✨ Premium modern UI with glassmorphism
- 🎨 Custom design system with TailwindCSS
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Fast page loads with Next.js optimization
- 🎯 Smooth animations with Framer Motion
- 🔐 JWT authentication with protected routes
- 📊 Interactive charts and analytics
- 🗺️ Map integration for location services
- 🔔 Real-time notifications
- 📱 PWA ready

## Pages

### Public Pages
- Landing page with hero, categories, features
- Login/Signup with OTP verification
- Service browsing & search
- Provider profiles

### Customer Pages
- User dashboard
- Booking management
- Payment history
- Reviews & ratings
- Wishlist
- Support tickets

### Provider Pages
- Provider dashboard
- Availability management
- Booking calendar
- Earnings & analytics
- Service management
- Profile & documents

### Admin Pages
- Admin dashboard
- User management
- Provider verification
- Service management
- Analytics & reports
- Support ticket management

## Components

- Button (Primary, Secondary, Ghost)
- Card (Default, Glass, Hover)
- Input fields with icons
- Modal & Dialog
- Dropdown & Select
- Toast notifications
- Loading skeletons
- Empty states
- Error boundaries

## Animation Showcase

- Hover effects (lift, glow, scale)
- Page transitions (fade, slide)
- Scroll animations (parallax)
- Loading animations (spinner, skeleton)
- Success animations (confetti, checkmark)
- Micro-interactions (button press, ripple)

## API Integration

The frontend connects to the Django REST API at:
- Development: `http://localhost:8000/api`
- Production: Configure via environment variables

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License