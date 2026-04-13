from django.db import models

class Room(models.Model):
    CATEGORY_CHOICES = [
        ('tourist', 'Turista'),
        ('premium', 'Premium'),
    ]
    
    number = models.IntegerField(unique=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    floor = models.IntegerField()
    price_daily = models.DecimalField(max_digits=8, decimal_places=2)
    capacity = models.IntegerField(default=2)
    features = models.JSONField(default=list)  # ["A/C", "WiFi", "Vista jardín"]
    equipment = models.JSONField(default=list)  # ["TV", "Minibar"]
    images = models.JSONField(default=list)  # URLs de imágenes
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Hab {self.number} - {self.get_category_display()}"