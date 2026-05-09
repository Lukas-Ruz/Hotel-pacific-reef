import pytest
from rest_framework import status

pytestmark = pytest.mark.django_db

class TestAuthSecurity:
    """Tests de seguridad para login y tokens"""
    
    def test_login_nonexistent_user(self, api_client):
        """Login con usuario inexistente debe fallar"""
        response = api_client.post('/api/auth/login/', {
            'username': 'noexiste@test.com',
            'password': 'cualquiercosa'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_wrong_password(self, api_client, client_user):
        """Login con contraseña incorrecta debe fallar"""
        response = api_client.post('/api/auth/login/', {
            'username': 'clienttest',
            'password': 'contraseñaincorrecta'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_access_protected_without_token(self, api_client):
        """Acceso a endpoint protegido sin token debe fallar"""
        response = api_client.get('/api/auth/profile/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_access_protected_with_invalid_token(self, api_client):
        """Token inválido debe ser rechazado"""
        api_client.credentials(HTTP_AUTHORIZATION='Bearer tokenfalso123')
        response = api_client.get('/api/auth/profile/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_access_protected_with_expired_token_format(self, api_client):
        """Token malformado debe ser rechazado"""
        api_client.credentials(HTTP_AUTHORIZATION='Token formatoincorrecto')
        response = api_client.get('/api/auth/profile/')
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]

    def test_brute_force_login_rate_limiting(self, api_client, client_user):
        """Múltiples intentos fallidos de login (simulación de rate limiting)"""
        for i in range(5):
            response = api_client.post('/api/auth/login/', {
                'username': 'clienttest',
                'password': f'wrongpassword{i}'
            })
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # El sexto intento también debe fallar, pero si hay rate limiting, podría ser 429 en lugar de 401
        response = api_client.post('/api/auth/login/', {
            'username': 'clienttest',
            'password': 'client123'  # Contraseña correcta
        })
        # Si hay rate limiting, esto podría ser 429. Si no, debe ser 200.
        # En prototipo sin rate limiting, debe permitir login
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_429_TOO_MANY_REQUESTS]