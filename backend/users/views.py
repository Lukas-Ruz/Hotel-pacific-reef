from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, RegisterSerializer
from .permissions import IsAdmin

# Login
class CustomTokenObtainPairView(TokenObtainPairView):
    
    # POST /api/auth/login/
    pass

# Registro de clientes o empleados
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  
    # Cualquiera puede registrarse como cliente
    
    def perform_create(self, serializer):
        if 'role' not in serializer.validated_data:
            serializer.validated_data['role'] = 'client'
        serializer.save()         # Si no se especifica rol, es cliente

# Perfil de usuario actual
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Solo actualizar datos básicos, no el rol
        data = request.data.copy()
        data.pop('role', None)  # Evitar que usuarios cambien su propio rol
        serializer = UserSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Listar usuarios ADMIN
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        return queryset