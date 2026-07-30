"""
Payments URLs
"""
from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('', views.PaymentListCreateView.as_view(), name='payment-list'),
    path('initiate/', views.InitiatePaymentView.as_view(), name='initiate'),
    path('wallet/', views.WalletDetailView.as_view(), name='wallet-detail'),
    path('coupons/', views.CouponListView.as_view(), name='coupon-list'),
    path('coupons/validate/', views.ValidateCouponView.as_view(), name='coupon-validate'),
    path('razorpay/create-order/', views.RazorpayCreateOrderView.as_view(), name='razorpay-create-order'),
    path('razorpay/verify-payment/', views.RazorpayVerifyPaymentView.as_view(), name='razorpay-verify-payment'),
]