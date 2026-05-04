import pytest
from rest_framework.test import APIClient
from users.models import User
from rooms.models import Room
from reservations.models import Reservation
from datetime import date, timedelta

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        username='admintest',
        email='admin@test.com',
        password='admin123',
        first_name='Admin',
        last_name='Test',
        role='admin'
    )

@pytest.fixture
def client_user(db):
    return User.objects.create_user(
        username='clienttest',
        email='client@test.com',
        password='client123',
        first_name='Juan',
        last_name='Cliente',
        role='client',
        phone='+123456789'
    )

@pytest.fixture
def employee_user(db):
    return User.objects.create_user(
        username='employeetest',
        email='employee@test.com',
        password='emp123',
        first_name='Pedro',
        last_name='Empleado',
        role='employee'
    )

@pytest.fixture
def sample_room(db):
    return Room.objects.create(
        number=201,
        category='tourist',
        floor=2,
        price_daily=80.00,
        capacity=2,
        features=['WiFi', 'A/C'],
        equipment=['TV', 'Minibar'],
        images=['http://test.com/img.jpg'],
        description='Habitación de prueba'
    )

@pytest.fixture
def premium_room(db):
    return Room.objects.create(
        number=301,
        category='premium',
        floor=3,
        price_daily=150.00,
        capacity=3,
        features=['Vista mar', 'Jacuzzi'],
        equipment=['Smart TV', 'Minibar premium'],
        images=['http://test.com/premium.jpg'],
        description='Suite premium de prueba'
    )

@pytest.fixture
def sample_reservation(db, client_user, sample_room):
    return Reservation.objects.create(
        user=client_user,
        room=sample_room,
        check_in=date.today() + timedelta(days=5),
        check_out=date.today() + timedelta(days=8),
        total_days=3,
        total_amount=240.00,
        advance_paid=72.00,
        qr_code='RES-TEST-001',
        status='confirmed'
    )