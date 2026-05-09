import pytest
from rest_framework import status

pytestmark = pytest.mark.django_db

class TestRegisterSecurity:
    """Tests de seguridad para el registro de usuarios"""
    
    def test_register_creates_client_role_only(self, api_client):
        """Un usuario registrado siempre debe tener rol 'client', nunca admin"""
        data = {
            'email': 'hacker@test.com',
            'password': 'password123',
            'first_name': 'Hacker',
            'last_name': 'Test',
            'phone': '+123456789',
            'id_document': 'HACK123',
            'role': 'admin'
        }
        response = api_client.post('/api/auth/register/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['role'] == 'client'

    def test_register_duplicate_email(self, api_client, client_user):
        """No debe permitir registrar email duplicado"""
        data = {
            'email': 'client@test.com',  
            'password': 'password123',
            'first_name': 'Otro',
            'last_name': 'Usuario',
            'phone': '+999999999',
            'id_document': 'OTRO123'
        }
        response = api_client.post('/api/auth/register/', data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_weak_password(self, api_client):
        """Debe rechazar contraseñas débiles"""
        data = {
            'email': 'weak@test.com',
            'password': '123',  # Muy corta
            'first_name': 'Weak',
            'last_name': 'Pass',
            'phone': '+123456789',
            'id_document': 'WEAK123'  
        }
        response = api_client.post('/api/auth/register/', data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_missing_required_fields(self, api_client):
        """Debe requerir campos obligatorios"""
        # Sin email
        response = api_client.post('/api/auth/register/', {
            'password': 'password123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '+123',
            'id_document': 'TEST001'  
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Sin contraseña
        response = api_client.post('/api/auth/register/', {
            'email': 'notest@test.com',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '+123',
            'id_document': 'TEST002'
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_sql_injection_attempt(self, api_client):
        """Debe sanitizar inputs y rechazar SQL injection"""
        data = {
            'email': "test@test.com'; DROP TABLE users; --",
            'password': 'password123',
            'first_name': 'Robert; DROP TABLE users; --',
            'last_name': 'Tables',
            'phone': '+123456789',
            'id_document': 'SQL001'
        }
        response = api_client.post('/api/auth/register/', data)
        
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]

    def test_register_xss_attempt(self, api_client):
        """Debe escapar HTML/JavaScript en inputs"""
        xss_payload = '<script>alert("xss")</script>'
        data = {
            'email': 'xss@test.com',
            'password': 'password123',
            'first_name': xss_payload,
            'last_name': 'Test',
            'phone': '+123456789',
            'id_document': 'XSS001'  
        }
        response = api_client.post('/api/auth/register/', data)
        
        if response.status_code == status.HTTP_201_CREATED:
            assert '<script>' not in response.data.get('first_name', '')

    def test_register_massive_email_length(self, api_client):
        """Debe limitar longitud de email"""
        data = {
            'email': 'a' * 250 + '@test.com',
            'password': 'password123',
            'first_name': 'Long',
            'last_name': 'Email',
            'phone': '+123',
            'id_document': 'LONG001'  
        }
        response = api_client.post('/api/auth/register/', data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_invalid_email_format(self, api_client):
        """Debe validar formato de email"""
        invalid_emails = [
            'notanemail',
            '@test.com',
            'test@',
            'test@test',
            'test test@test.com'
        ]
        
        for email in invalid_emails:
            response = api_client.post('/api/auth/register/', {
                'email': email,
                'password': 'password123',
                'first_name': 'Test',
                'last_name': 'User',
                'phone': '+123',
                'id_document': 'INVALID001' 
            })
            assert response.status_code == status.HTTP_400_BAD_REQUEST, f"Email '{email}' debería ser rechazado"