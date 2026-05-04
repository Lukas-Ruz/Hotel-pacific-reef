import pytest
from rest_framework import status

pytestmark = pytest.mark.django_db

class TestAuthentication:
    def test_register_client(self, api_client):
        data = {
            'email': 'nuevo@test.com',
            'password': 'password123',
            'first_name': 'Nuevo',
            'last_name': 'Usuario',
            'phone': '+123456789'
        }
        response = api_client.post('/api/auth/register/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['email'] == 'nuevo@test.com'

    def test_register_password_too_short(self, api_client):
        data = {
            'email': 'nuevo@test.com',
            'password': '123',
            'first_name': 'Nuevo',
            'last_name': 'Usuario',
            'phone': '+123456789'
        }
        response = api_client.post('/api/auth/register/', data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_success(self, api_client, client_user):
        response = api_client.post('/api/auth/login/', {
            'username': 'client@test.com',
            'password': 'client123'
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_invalid_credentials(self, api_client):
        response = api_client.post('/api/auth/login/', {
            'username': 'noexiste@test.com',
            'password': 'wrongpass'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_profile_access_authenticated(self, api_client, client_user):
        api_client.force_authenticate(user=client_user)
        response = api_client.get('/api/auth/profile/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'client@test.com'

    def test_profile_access_unauthenticated(self, api_client):
        response = api_client.get('/api/auth/profile/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_admin_can_list_users(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get('/api/auth/users/')
        assert response.status_code == status.HTTP_200_OK

    def test_client_cannot_list_users(self, api_client, client_user):
        api_client.force_authenticate(user=client_user)
        response = api_client.get('/api/auth/users/')
        assert response.status_code == status.HTTP_403_FORBIDDEN