import pytest
from rest_framework import status
from datetime import date, timedelta

pytestmark = pytest.mark.django_db

class TestRoomAvailability:
    
    def test_list_rooms(self, api_client, sample_room, premium_room):
        response = api_client.get('/api/rooms/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_filter_tourist_rooms(self, api_client, sample_room, premium_room):
        response = api_client.get('/api/rooms/?category=tourist')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['category'] == 'tourist'

    def test_check_availability_no_conflicts(self, api_client, sample_room):
        # Formato DD-MM-YYYY
        check_in = (date.today() + timedelta(days=10)).strftime('%d-%m-%Y')
        check_out = (date.today() + timedelta(days=12)).strftime('%d-%m-%Y')
        
        response = api_client.get(
            f'/api/rooms/availability/?check_in={check_in}&check_out={check_out}'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'rooms' in response.data
        assert response.data['available_count'] >= 1

    def test_check_availability_with_conflict(self, api_client, sample_room, sample_reservation):
        check_in = sample_reservation.check_in.strftime('%d-%m-%Y')
        check_out = sample_reservation.check_out.strftime('%d-%m-%Y')
        
        response = api_client.get(
            f'/api/rooms/availability/?check_in={check_in}&check_out={check_out}'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'rooms' in response.data
        
        # La habitación sample_room NO debe estar disponible
        room_ids = [r['id'] for r in response.data['rooms']]
        assert sample_room.id not in room_ids

    def test_check_availability_invalid_dates(self, api_client):
        # Fecha de salida antes de entrada
        check_in = '15-01-2024'
        check_out = '10-01-2024'
        
        response = api_client.get(
            f'/api/rooms/availability/?check_in={check_in}&check_out={check_out}'
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_check_availability_missing_params(self, api_client):
        response = api_client.get('/api/rooms/availability/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_check_availability_invalid_format(self, api_client):
        check_in = '2024-01-15'
        check_out = '2024-01-18'
        
        response = api_client.get(
            f'/api/rooms/availability/?check_in={check_in}&check_out={check_out}'
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST