from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, 
    RegisterView, 
    profile_view, 
    UserListView
)

urlpatterns = [
    # Login
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Recargar
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Registro
    path('register/', RegisterView.as_view(), name='register'),
    
    # Perfil
    path('profile/', profile_view, name='profile'),
    
    # Lista usuarios (admin)
    path('users/', UserListView.as_view(), name='user_list'),
]