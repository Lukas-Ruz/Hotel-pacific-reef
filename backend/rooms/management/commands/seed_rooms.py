from django.core.management.base import BaseCommand
from rooms.models import Room

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # Limpiar existentes
        Room.objects.all().delete()
        
        # 30 Habitaciones Turista (201-230)
        for i in range(1, 31):
            Room.objects.create(
                number=200 + i,
                category='tourist',
                floor=2,
                price_daily=80.00,
                capacity=2,
                features=['Cama matrimonial', 'Baño privado', 'Aire acondicionado', 'WiFi'],
                equipment=['TV Cable', 'Minibar', 'Caja fuerte'],
                images=[
                    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
                    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
                ],
                description=f'Habitación Turista {200+i} con vista al jardín'
            )
        
        # 8 Habitaciones Premium (301-308)
        for i in range(1, 9):
            Room.objects.create(
                number=300 + i,
                category='premium',
                floor=3,
                price_daily=150.00,
                capacity=3,
                features=['Vista al mar', 'King Size', 'Balcón', 'Jacuzzi'],
                equipment=['Smart TV', 'Minibar premium', 'Cafetera'],
                images=[
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
                    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
                ],
                description=f'Suite Premium {300+i} con vista panorámica al océano'
            )
        
        self.stdout.write(self.style.SUCCESS('38 habitaciones creadas exitosamente'))