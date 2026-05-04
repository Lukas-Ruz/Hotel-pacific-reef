import pytest
from rest_framework import status
from datetime import date, timedelta

pytestmark = pytest.mark.django_db

class TestReservations:
    def test_create_reservation_success(self, api_client, client_user, sample_room):
        api_client.force_authenticate(user=client_user)
        
        data = {
            'room_id': sample_room.id,
            'check_in': (date.today() + timedelta(days=15)).isoformat(),
            'check_out': (date.today() + timedelta(days=18)).isoformat()
        }
        
        response = api_client.post('/api/reservations/create/', data)
        assert response.status_code == status.HTTP_201_CREATED
        
        # Verificar el cálculo con Decimal
        assert response.data['reservation']['total_days'] == 3
        assert float(response.data['reservation']['advance_paid']) == 72.00

    def test_create_reservation_double_booking(self, api_client, client_user, sample_room, sample_reservation):
        api_client.force_authenticate(user=client_user)
        
        # Intentar reservar mismas fechas
        data = {
            'room_id': sample_room.id,
            'check_in': sample_reservation.check_in.isoformat(),
            'check_out': sample_reservation.check_out.isoformat()
        }
        
        response = api_client.post('/api/reservations/create/', data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_my_reservations(self, api_client, client_user, sample_reservation):
        api_client.force_authenticate(user=client_user)
        response = api_client.get('/api/reservations/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_admin_sees_all_reservations(self, api_client, admin_user, sample_reservation):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get('/api/reservations/')
        assert response.status_code == status.HTTP_200_OK

    def test_validate_qr_employee(self, api_client, employee_user, sample_reservation):
        api_client.force_authenticate(user=employee_user)
        response = api_client.get(
            f'/api/reservations/validate-qr/?qr_code={sample_reservation.qr_code}'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] is True

    def test_validate_qr_invalid(self, api_client, employee_user):
        api_client.force_authenticate(user=employee_user)
        response = api_client.get('/api/reservations/validate-qr/?qr_code=FAKE-CODE')
        assert response.status_code == status.HTTP_404_NOT_FOUND