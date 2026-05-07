from django.urls import path
from .views import (
    ReservationCreateView, 
    ReservationListView, 
    ReservationDetailView,
    ReservationCancelView,
    validate_qr
)

urlpatterns = [
    path('', ReservationListView.as_view(), name='reservation_list'),
    path('create/', ReservationCreateView.as_view(), name='reservation_create'),
    path('validate-qr/', validate_qr, name='validate_qr'),
    path('<str:id>/', ReservationDetailView.as_view(), name='reservation_detail'),
    path('<str:id>/cancel/', ReservationCancelView.as_view(), name='reservation_cancel'),
]