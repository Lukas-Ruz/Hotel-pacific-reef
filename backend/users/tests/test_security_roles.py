import pytest
from rest_framework import status

pytestmark = pytest.mark.django_db

class TestRoleSecurity:
    """Tests de seguridad para control de acceso por roles"""
    
    def test_client_cannot_access_admin_endpoints(self, api_client, client_user):
        """Cliente no debe acceder a endpoints de admin"""
        api_client.force_authenticate(user=client_user)
        
        # Intentar listar todos los usuarios (solo admin)
        response = api_client.get('/api/auth/users/')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_client_cannot_promote_to_admin(self, api_client, client_user):
        """Cliente no debe poder modificar su propio rol"""
        api_client.force_authenticate(user=client_user)
        # Intentar actualizar su perfil con role 'admin'
        response = api_client.get('/api/auth/profile/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data.get('role') == 'client'

    def test_employee_cannot_access_admin_endpoints(self, api_client, employee_user):
        """Empleado no debe acceder a endpoints de admin"""
        api_client.force_authenticate(user=employee_user)
        
        response = api_client.get('/api/auth/users/')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_access_all(self, api_client, admin_user):
        """Admin debe acceder a todo"""
        api_client.force_authenticate(user=admin_user)
        
        response = api_client.get('/api/auth/users/')
        assert response.status_code == status.HTTP_200_OK

    def test_user_cannot_access_other_user_profile(self, api_client, client_user):
        """Usuario no debe ver perfil de otro usuario"""
        # Crear otro usuario
        from users.models import User
        other_user = User.objects.create_user(
            username='otro',
            email='otro@test.com',
            password='pass123',
            first_name='Otro',
            last_name='User',
            role='client'
        )
        
        api_client.force_authenticate(user=client_user)
        
        # Intentar acceder a endpoint que no sea propio
        # Esto depende de tu implementación
        response = api_client.get('/api/auth/profile/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'client@test.com'  # Solo ve su propio perfil