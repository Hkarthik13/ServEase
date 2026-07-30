"""
Lightweight service intelligence helpers.

These functions are deterministic on purpose: they keep the demo working
without an external AI key while giving the frontend useful, explainable output.
"""
from decimal import Decimal
import math
from typing import Optional, Tuple


ISSUE_RULES = [
    {
        "category": "Electrician",
        "keywords": ["fan", "switch", "wire", "wiring", "power", "socket", "light", "electric", "current", "mcb"],
        "causes": ["Loose wiring", "Aging switchboard", "Overloaded circuit"],
        "repair": "Electrical inspection and repair",
    },
    {
        "category": "Plumber",
        "keywords": ["water", "leak", "tap", "pipe", "drain", "toilet", "sink", "flush", "bathroom"],
        "causes": ["Pipe joint leakage", "Blocked drain line", "Worn washer or valve"],
        "repair": "Leak detection and plumbing repair",
    },
    {
        "category": "AC Service",
        "keywords": ["ac", "cooling", "air conditioner", "compressor", "gas refill", "filter"],
        "causes": ["Dirty filter", "Low refrigerant", "Outdoor unit airflow issue"],
        "repair": "AC diagnosis and service",
    },
    {
        "category": "Cleaning",
        "keywords": ["clean", "dust", "deep cleaning", "sofa", "kitchen", "bathroom stain"],
        "causes": ["Surface buildup", "Hard water stains", "Grease deposits"],
        "repair": "Deep cleaning service",
    },
    {
        "category": "Painter",
        "keywords": ["paint", "wall", "damp", "crack", "patch", "colour", "color"],
        "causes": ["Moisture seepage", "Wall surface cracks", "Old paint layer"],
        "repair": "Wall preparation and painting",
    },
]

EMERGENCY_KEYWORDS = [
    "gas leak",
    "sparking",
    "shock",
    "burning smell",
    "short circuit",
    "flooding",
    "pipe burst",
    "no power",
    "fire",
]


def _as_decimal(value):
    if value is None:
        return Decimal("0")
    return Decimal(str(value))


def detect_issue(issue_text):
    text = (issue_text or "").lower()
    matches = []

    for rule in ISSUE_RULES:
        score = sum(1 for keyword in rule["keywords"] if keyword in text)
        if score:
            matches.append((score, rule))

    if not matches:
        return {
            "category": "General Home Service",
            "confidence": 42,
            "causes": ["Issue needs technician inspection"],
            "repair": "General diagnosis",
        }

    matches.sort(key=lambda item: item[0], reverse=True)
    score, rule = matches[0]
    confidence = min(96, 58 + score * 12)
    return {
        "category": rule["category"],
        "confidence": confidence,
        "causes": rule["causes"],
        "repair": rule["repair"],
    }


def is_emergency(issue_text):
    text = (issue_text or "").lower()
    matched = [keyword for keyword in EMERGENCY_KEYWORDS if keyword in text]
    return bool(matched), matched


def estimate_for_service(service, urgency=False):
    base_price = _as_decimal(service.base_price or service.price_range_min or service.hourly_rate)
    if base_price <= 0:
        base_price = Decimal("499")

    urgency_fee = Decimal("150") if urgency else Decimal("0")
    lower = max(Decimal("99"), base_price * Decimal("0.90") + urgency_fee)
    upper = base_price * Decimal("1.25") + urgency_fee

    return {
        "min_cost": int(lower.quantize(Decimal("1"))),
        "max_cost": int(upper.quantize(Decimal("1"))),
        "duration_minutes": service.duration_minutes or 60,
        "urgency_fee": int(urgency_fee),
    }


def _haversine_distance_km(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    lat1, lon1 = a
    lat2, lon2 = b
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    hav = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * (2 * math.atan2(math.sqrt(hav), math.sqrt(1 - hav)))


def provider_match_score(service, customer_location: Optional[Tuple[float, float]] = None, weights: Optional[dict] = None):
    profile = getattr(service.provider, "provider_profile", None)
    if not profile:
        return 40

    if weights is None:
        weights = {
            "rating": 0.40,
            "experience": 0.15,
            "jobs": 0.10,
            "featured": 0.05,
            "available": 0.10,
            "verified": 0.10,
            "distance": 0.10,
        }

    rating_score = float(profile.average_rating or 0) / 5.0
    experience_score = min(profile.years_of_experience or 0, 20) / 20.0
    jobs_score = min(profile.total_jobs or 0, 500) / 500.0
    featured_score = 1.0 if getattr(profile, "is_featured", False) else 0.0
    available_score = 1.0 if getattr(profile, "is_available", False) else 0.0
    verified_score = 1.0 if getattr(profile, "verification_status", "") == "APPROVED" else 0.0

    distance_score = 0.0
    try:
        if customer_location and getattr(service.provider, "latitude", None) and getattr(service.provider, "longitude", None):
            prov_loc = (float(service.provider.latitude), float(service.provider.longitude))
            dist_km = _haversine_distance_km(customer_location, prov_loc)
            distance_score = max(0.0, 1.0 - min(dist_km / 50.0, 1.0))
    except Exception:
        distance_score = 0.0

    aggregate = (
        rating_score * weights["rating"]
        + experience_score * weights["experience"]
        + jobs_score * weights["jobs"]
        + featured_score * weights["featured"]
        + available_score * weights["available"]
        + verified_score * weights["verified"]
        + distance_score * weights["distance"]
    )

    return round(max(0, min(100, aggregate * 100)))


def analyze_image(image_file, service=None):
    name = getattr(image_file, "name", "") or ""
    size = getattr(image_file, "size", None) or 0
    text = name.lower()

    if any(k in text for k in ["switch", "broken", "crack"]):
        det = "Broken switch or plate"
        causes = ["Physical damage", "Loose connection"]
        repair = "Replace switch/plate and wiring check"
        severity = "medium"
        confidence = 78
    elif any(k in text for k in ["leak", "water", "pipe"]):
        det = "Water leak / pipe damage"
        causes = ["Corroded pipe", "Joint failure"]
        repair = "Plumbing repair and sealing"
        severity = "high" if size > 200000 else "medium"
        confidence = 82
    elif any(k in text for k in ["ac", "compressor", "cooling"]):
        det = "AC unit issue (external)"
        causes = ["Fan damage", "Motor wear", "Blocked fins"]
        repair = "AC servicing and part replacement"
        severity = "medium"
        confidence = 70
    else:
        det = "Visual anomaly"
        causes = ["Needs technician inspection"]
        repair = "On-site diagnosis"
        severity = "low"
        confidence = 50

    estimate = None
    try:
        if service is not None:
            estimate = estimate_for_service(service)
    except Exception:
        estimate = None

    return {
        "detected": det,
        "possible_causes": causes,
        "repair": repair,
        "severity": severity,
        "confidence": confidence,
        "estimate": estimate,
    }
