import os
import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date, time
from apps.users.models import User, Address
from apps.providers.models import Provider, ProviderAvailability
from apps.categories.models import Category
from apps.services.models import Service, ServiceFeature
from apps.bookings.models import Booking, BookingStatusHistory
from apps.payments.models import Coupon, Wallet, WalletTransaction

class Command(BaseCommand):
    help = 'Seeds database with categories, mock providers, and customers'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing database...")
        BookingStatusHistory.objects.all().delete()
        Booking.objects.all().delete()
        ServiceFeature.objects.all().delete()
        Service.objects.all().delete()
        ProviderAvailability.objects.all().delete()
        Provider.objects.all().delete()
        Address.objects.all().delete()
        WalletTransaction.objects.all().delete()
        Wallet.objects.all().delete()
        Coupon.objects.all().delete()
        User.objects.all().delete()
        Category.objects.all().delete()

        self.stdout.write("Creating categories...")
        categories_data = [
            {"name": "Electrician", "slug": "electrician", "icon": "Zap", "description": "Ceiling fans, switches, wiring repairs"},
            {"name": "Plumber", "slug": "plumber", "icon": "Wrench", "description": "Tap leaks, pipe fitting, drainage blocks"},
            {"name": "Painter", "slug": "painter", "icon": "Paintbrush", "description": "Wall painting, waterproof painting, designs"},
            {"name": "Carpenter", "slug": "carpenter", "icon": "Home", "description": "Wooden repairs, doors, locks, assembly"},
            {"name": "Cleaning", "slug": "cleaning", "icon": "Sparkles", "description": "Home deep clean, kitchen clean, bathroom wash"},
            {"name": "AC Service", "slug": "ac-service", "icon": "AirVent", "description": "AC wet wash, gas recharge, filter cleaning"},
            {"name": "RO Repair", "slug": "ro-repair", "icon": "Droplet", "description": "RO service, filter changes, membrane check"},
            {"name": "Appliance Repair", "slug": "appliance-repair", "icon": "Tv", "description": "TV mounting, washing machine repair, fridge service"}
        ]

        categories = {}
        for cat in categories_data:
            c = Category.objects.create(
                name=cat["name"],
                slug=cat["slug"],
                icon=cat["icon"],
                description=cat["description"],
                is_active=True,
                is_featured=True
            )
            categories[cat["slug"]] = c

        self.stdout.write("Creating default users...")
        # Customer
        customer_user = User.objects.create(
            email="customer@servease.com",
            first_name="Sathish",
            last_name="Kumar",
            phone="9876543210",
            role="CUSTOMER",
            is_verified=True,
            address="12, MGR Street, T. Nagar",
            city="Chennai",
            state="Tamil Nadu",
            pincode="600017"
        )
        customer_user.set_password("testpass123")
        customer_user.save()
        
        # Create wallet for customer
        customer_wallet = Wallet.objects.create(user=customer_user, balance=500.00)
        WalletTransaction.objects.create(
            wallet=customer_wallet,
            transaction_type='CREDIT',
            amount=500.00,
            balance_after=500.00,
            description="Welcome Bonus Wallet Credit"
        )

        customer_address = Address.objects.create(
            user=customer_user,
            label="Home",
            address_line="12, MGR Street, T. Nagar",
            city="Chennai",
            state="Tamil Nadu",
            pincode="600017",
            is_primary=True
        )

        # Admin
        admin_user = User.objects.create(
            email="admin@servease.com",
            first_name="Admin",
            last_name="ServEase",
            phone="9876543219",
            role="ADMIN",
            is_verified=True,
            is_staff=True,
            is_superuser=True
        )
        admin_user.set_password("testpass123")
        admin_user.save()

        # Providers
        provider_details = [
            {
                "email": "electrician@servease.com",
                "first_name": "Ramesh",
                "last_name": "Prasad",
                "phone": "9876543211",
                "business_name": "Ramesh Electricals",
                "exp": 8,
                "radius": 15,
                "cat_slug": "electrician",
                "services": [
                    {"name": "Ceiling Fan Installation", "price": 299.00, "duration": 30, "pop": True},
                    {"name": "Short Circuit Detection & Repair", "price": 499.00, "duration": 60, "pop": False},
                    {"name": "Smart Switchboard Setup", "price": 799.00, "duration": 90, "pop": True}
                ]
            },
            {
                "email": "plumber@servease.com",
                "first_name": "Suresh",
                "last_name": "Kumar",
                "phone": "9876543212",
                "business_name": "Suresh Plumbing Works",
                "exp": 5,
                "radius": 10,
                "cat_slug": "plumber",
                "services": [
                    {"name": "Water Tap Leakage Fix", "price": 149.00, "duration": 20, "pop": True},
                    {"name": "Bathroom Sink Fitting", "price": 599.00, "duration": 65, "pop": True},
                    {"name": "Complete Drainage Blockage Clean", "price": 999.00, "duration": 120, "pop": False}
                ]
            },
            {
                "email": "cleaner@servease.com",
                "first_name": "Magesh",
                "last_name": "R",
                "phone": "9876543213",
                "business_name": "Magesh Deep Cleaners",
                "exp": 6,
                "radius": 20,
                "cat_slug": "cleaning",
                "services": [
                    {"name": "Full House Deep Cleaning", "price": 2499.00, "duration": 240, "pop": True},
                    {"name": "Kitchen Deep Clean", "price": 899.00, "duration": 120, "pop": True},
                    {"name": "Bathroom Deep Cleaning", "price": 399.00, "duration": 60, "pop": False}
                ]
            },
            {
                "email": "acservice@servease.com",
                "first_name": "Karthik",
                "last_name": "Selvam",
                "phone": "9876543214",
                "business_name": "Karthik AC Solutions",
                "exp": 7,
                "radius": 12,
                "cat_slug": "ac-service",
                "services": [
                    {"name": "AC Jet Cleaning (Wet Wash)", "price": 599.00, "duration": 45, "pop": True},
                    {"name": "Gas Recharge & Leak Fix", "price": 1899.00, "duration": 90, "pop": True},
                    {"name": "AC Installation Service", "price": 1499.00, "duration": 120, "pop": False}
                ]
            }
        ]

        self.stdout.write("Creating providers and services...")
        providers = []
        for prov in provider_details:
            # User
            u = User.objects.create(
                email=prov["email"],
                first_name=prov["first_name"],
                last_name=prov["last_name"],
                phone=prov["phone"],
                role="PROVIDER",
                is_verified=True,
                city="Chennai",
                state="Tamil Nadu",
                pincode="600017"
            )
            u.set_password("testpass123")
            u.save()

            # Profile
            p = Provider.objects.create(
                user=u,
                business_name=prov["business_name"],
                business_description=f"Experienced service provider specializing in {prov['cat_slug']} works. Guaranteed satisfaction.",
                years_of_experience=prov["exp"],
                service_radius=prov["radius"],
                verification_status="APPROVED",
                average_rating=4.5 + (0.1 * random.randint(1, 4)),
                total_reviews=random.randint(5, 25),
                total_jobs=random.randint(10, 50),
                total_earnings=15000.00 + (2500.00 * random.randint(1, 10)),
                is_available=True,
                is_featured=True,
                languages=["English", "Tamil"]
            )
            providers.append(p)

            # Availability
            for day in range(7):
                ProviderAvailability.objects.create(
                    provider=p,
                    day_of_week=day,
                    start_time=time(9, 0),
                    end_time=time(18, 0),
                    is_available=True
                )

            # Services
            category = categories[prov["cat_slug"]]
            for ser in prov["services"]:
                s = Service.objects.create(
                    category=category,
                    provider=u,
                    name=ser["name"],
                    slug=ser["name"].lower().replace(" ", "-").replace("(", "").replace(")", ""),
                    description=f"Premium {ser['name']} service using high quality equipment and professional expertise.",
                    short_description=f"Get professional {ser['name']} service done at your place.",
                    pricing_type="FIXED",
                    base_price=ser["price"],
                    duration_minutes=ser["duration"],
                    is_popular=ser["pop"],
                    is_featured=ser["pop"],
                    is_active=True
                )
                ServiceFeature.objects.create(service=s, name="100% Satisfaction Guarantee", sort_order=1)
                ServiceFeature.objects.create(service=s, name="Vetted Professional", sort_order=2)
                ServiceFeature.objects.create(service=s, name="Warranty Included", sort_order=3)

        self.stdout.write("Creating coupons...")
        Coupon.objects.create(
            code="WELCOME10",
            description="10% discount on all bookings",
            discount_type="PERCENTAGE",
            discount_value=10.00,
            minimum_amount=199.00,
            valid_from=timezone.now() - timedelta(days=5),
            valid_until=timezone.now() + timedelta(days=365),
            is_active=True
        )
        Coupon.objects.create(
            code="SUPER50",
            description="Flat ₹50 off on bookings",
            discount_type="FIXED",
            discount_value=50.00,
            minimum_amount=299.00,
            valid_from=timezone.now() - timedelta(days=5),
            valid_until=timezone.now() + timedelta(days=365),
            is_active=True
        )

        self.stdout.write("Creating sample bookings...")
        # Upcoming booking
        upcoming_service = Service.objects.filter(is_popular=True).first()
        if upcoming_service:
            b1 = Booking.objects.create(
                customer=customer_user,
                provider=upcoming_service.provider,
                service=upcoming_service,
                category=upcoming_service.category,
                service_address=customer_address,
                service_date=date.today() + timedelta(days=2),
                service_time=time(11, 0),
                service_duration_minutes=upcoming_service.duration_minutes,
                base_price=upcoming_service.base_price,
                total_amount=upcoming_service.base_price + Decimal('25.00'),
                platform_fee=Decimal('15.00'),
                tax_amount=Decimal('10.00'),
                provider_amount=upcoming_service.base_price,
                status="ACCEPTED",
                payment_status="PAID",
                payment_method="UPI",
                accepted_at=timezone.now()
            )
            BookingStatusHistory.objects.create(booking=b1, status="PENDING", notes="Booking created by Customer")
            BookingStatusHistory.objects.create(booking=b1, status="ACCEPTED", notes="Booking accepted by Provider")

        # Past completed booking
        past_service = Service.objects.filter(is_popular=True).last()
        if past_service:
            b2 = Booking.objects.create(
                customer=customer_user,
                provider=past_service.provider,
                service=past_service,
                category=past_service.category,
                service_address=customer_address,
                service_date=date.today() - timedelta(days=4),
                service_time=time(14, 30),
                service_duration_minutes=past_service.duration_minutes,
                base_price=past_service.base_price,
                total_amount=past_service.base_price + Decimal('25.00'),
                platform_fee=Decimal('15.00'),
                tax_amount=Decimal('10.00'),
                provider_amount=past_service.base_price,
                status="COMPLETED",
                payment_status="PAID",
                payment_method="CARD",
                accepted_at=timezone.now() - timedelta(days=4),
                started_at=timezone.now() - timedelta(days=4, hours=1),
                completed_at=timezone.now() - timedelta(days=4, minutes=30)
            )
            BookingStatusHistory.objects.create(booking=b2, status="PENDING", notes="Booking created")
            BookingStatusHistory.objects.create(booking=b2, status="ACCEPTED", notes="Booking accepted")
            BookingStatusHistory.objects.create(booking=b2, status="COMPLETED", notes="Service completed")

        self.stdout.write("Database seeded successfully!")
