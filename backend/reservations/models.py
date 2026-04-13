from django.db import models
from django.conf import settings
import uuid

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmada'),
        ('cancelled', 'Cancelada'),
        ('completed', 'Completada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    room = models.ForeignKey('rooms.Room', on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    total_days = models.IntegerField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    advance_paid = models.DecimalField(max_digits=10, decimal_places=2)  # 30%
    payment_status = models.CharField(max_length=20, default='pending')
    qr_code = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

        # Falta Evitar doble reserva misma habitación mismas fechas (RNF-2-07)

    def __str__(self):
        return f"Res {self.id} - Hab {self.room.number}"