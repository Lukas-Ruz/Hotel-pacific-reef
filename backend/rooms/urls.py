from django.urls import path
from .views import RoomListView, RoomDetailView, check_availability

urlpatterns = [
    path('', RoomListView.as_view(), name='room_list'),
    path('availability/', check_availability, name='check_availability'),
    path('<int:id>/', RoomDetailView.as_view(), name='room_detail'),
]