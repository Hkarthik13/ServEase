"""
Admin Panel URLs
"""
from django.urls import path
from . import views

app_name = 'adminpanel'

urlpatterns = [
    path('dashboard/', views.AdminDashboardView.as_view(), name='dashboard'),
    path('users/', views.AdminUserListView.as_view(), name='users-list'),
    path('users/<int:pk>/toggle-active/', views.AdminUserToggleActiveView.as_view(), name='users-toggle-active'),
]