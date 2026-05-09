import pytest
from rest_framework import status
from datetime import date, timedelta
from reservations.models import Reservation

pytestmark = pytest.mark.django_db

class TestBookingSecurity:
    """Tests de seguridad para reservas"""
    
    def test_user_cannot_cancel_other_user_reservation(self, api_client, client_user, sample_reservation):
        """Usuario no debe cancelar reserva de otro"""
        # Crear otro usuario y reserva
        from users.models import User
        from rooms.models import Room
        
        other_user = User.objects.create_user(
            username='otrocliente',
            email='otro@demo.com',
            password='pass123',
            first_name='Otro',
            last_name='Cliente',
            role='client'
        )
        
        other_room = Room.objects.create(
            number=202, category='tourist', floor=2,
            price_daily=80, capacity=2,
            features=['WiFi'], equipment=['TV'],
            images=[], description='Otra habitación'
        )
        
        other_reservation = Reservation.objects.create(
            user=other_user, room=other_room,
            check_in=date.today() + timedelta(days=10),
            check_out=date.today() + timedelta(days=12),
            total_days=2, total_amount=160,
            advance_paid=48, qr_code='RES-OTRO-001',
            status='confirmed'
        )
        
        api_client.force_authenticate(user=client_user)
        
        # Intentar cancelar reserva de otro usuario
        response = api_client.patch(f'/api/reservations/{other_reservation.id}/cancel/')
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]

    def test_user_cannot_create_reservation_for_past_dates(self, api_client, client_user, sample_room):
        """No debe permitir reservar fechas pasadas"""
        api_client.force_authenticate(user=client_user)
        
        response = api_client.post('/api/reservations/create/', {
            'room_id': sample_room.id,
            'check_in': (date.today() - timedelta(days=5)).isoformat(),
            'check_out': (date.today() - timedelta(days=2)).isoformat()
        }, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_cannot_create_reservation_without_payment(self, api_client, client_user, sample_room):
        """La reserva debe requerir pago del 30% (simulado en backend)"""
        api_client.force_authenticate(user=client_user)
        
        response = api_client.post('/api/reservations/create/', {
            'room_id': sample_room.id,
            'check_in': (date.today() + timedelta(days=15)).isoformat(),
            'check_out': (date.today() + timedelta(days=18)).isoformat()
        }, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        # Verificar que el anticipo se calculó automáticamente (30%)
        assert float(response.data['reservation']['advance_paid']) > 0

    def test_double_booking_prevented(self, api_client, client_user, sample_room, sample_reservation):
        """No debe permitir doble reserva de misma habitación y fechas"""
        api_client.force_authenticate(user=client_user)
        
        # Intentar reservar mismas fechas
        response = api_client.post('/api/reservations/create/', {
            'room_id': sample_room.id,
            'check_in': sample_reservation.check_in.isoformat(),
            'check_out': sample_reservation.check_out.isoformat()
        }, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_employee_can_validate_any_qr(self, api_client, employee_user, sample_reservation):
        """Empleado debe validar cualquier QR confirmado"""
        api_client.force_authenticate(user=employee_user)
        
        response = api_client.post('/api/reservations/validate-qr/', {
            'qr_code': sample_reservation.qr_code
        }, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] is True

    def test_client_cannot_validate_qr(self, api_client, client_user, sample_reservation):
        """Cliente no debe poder validar QR (solo empleados/admin)"""
        api_client.force_authenticate(user=client_user)
        
        response = api_client.post('/api/reservations/validate-qr/', {
            'qr_code': sample_reservation.qr_code
        }, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN