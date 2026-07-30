"""
Providers URLs
"""
from django.urls import path
from . import views

app_name = 'providers'

urlpatterns = [
    path('', views.ProviderListCreateView.as_view(), name='provider-list'),
    path('<int:pk>/', views.ProviderDetailView.as_view(), name='provider-detail'),
    path('dashboard/', views.ProviderDashboardView.as_view(), name='dashboard'),
    path('profile/', views.ProviderProfileView.as_view(), name='profile'),
    path('documents/', views.ProviderDocumentListView.as_view(), name='documents'),
    path('availability/', views.ProviderAvailabilityView.as_view(), name='availability'),
]