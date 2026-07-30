"""
Analytics URLs
"""
from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('stats/', views.AnalyticsStatsView.as_view(), name='stats'),
]