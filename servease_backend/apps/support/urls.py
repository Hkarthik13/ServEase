"""
Support URLs
"""
from django.urls import path
from . import views

app_name = 'support'

urlpatterns = [
    path('tickets/', views.SupportTicketListView.as_view(), name='ticket-list'),
]