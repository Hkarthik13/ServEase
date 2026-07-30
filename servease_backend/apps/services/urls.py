"""
Services URLs
"""
from django.urls import path
from . import views

app_name = 'services'

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('ai-assistant/', views.AIServiceAssistantView.as_view(), name='ai-service-assistant'),
    path('', views.ServiceListView.as_view(), name='service-list'),
    path('<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
]
