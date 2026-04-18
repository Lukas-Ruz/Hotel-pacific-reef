from rest_framework import serializers
from .models import Room

class RoomListSerializer(serializers.ModelSerializer):
    
    # listado con info basica
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    is_available = serializers.BooleanField(read_only=True)  # Se calculará en la vista
    
    class Meta:
        model = Room
        fields = ['id', 'number', 'category', 'category_display', 'price_daily', 
                  'capacity', 'images', 'is_available']

class RoomDetailSerializer(serializers.ModelSerializer):
    
    #detalle completo de habitacion
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Room
        fields = '__all__'
        extra_fields = ['category_display', 'total_price']