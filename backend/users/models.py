from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('client', 'Cliente/Turista'),
        ('employee', 'Empleado'),
        ('admin', 'Administrador Hotel'),
        ('booking_admin', 'Administrador Reservas'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    phone = models.CharField(max_length=20, blank=True)
    id_document = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"