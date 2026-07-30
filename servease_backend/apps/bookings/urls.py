"""
Bookings URLs
"""
from django.urls import path
from . import views

app_name = 'bookings'

urlpatterns = [
    path('', views.BookingListCreateView.as_view(), name='booking-list'),
    path('<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/cancel/', views.CancelBookingView.as_view(), name='booking-cancel'),
    path('<int:pk>/status/', views.UpdateBookingStatusView.as_view(), name='booking-status-update'),
]