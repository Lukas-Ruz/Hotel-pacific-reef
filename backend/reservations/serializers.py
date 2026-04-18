from rest_framework import serializers
from .models import Reservation
from rooms.models import Room
from rooms.serializers import RoomListSerializer

class ReservationCreateSerializer(serializers.ModelSerializer):
  
    # Para crear reservas (input)
    room_id = serializers.IntegerField(write_only=True)
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    
    class Meta:
        model = Reservation
        fields = ['room_id', 'check_in', 'check_out']
    
    def validate(self, data):
        
        # Validar que check_out > check_in
        if data['check_out'] <= data['check_in']:
            raise serializers.ValidationError("La fecha de salida debe ser posterior a la entrada")
        
        # Validar disponibilidad (doble verificación)
        room = Room.objects.get(id=data['room_id'])
        conflicting = Reservation.objects.filter(
            room=room,
            status='confirmed',
            check_in__lt=data['check_out'],
            check_out__gt=data['check_in']
        ).exists()
        
        if conflicting:
            raise serializers.ValidationError("La habitación no está disponible para esas fechas")
        
        return data

class ReservationDetailSerializer(serializers.ModelSerializer):
    
    # Para mostrar reservas (output)
    room = RoomListSerializer(read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    advance_amount = serializers.SerializerMethodField()
    balance_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Reservation
        fields = ['id', 'room', 'user_name', 'check_in', 'check_out', 
                  'total_days', 'total_amount', 'advance_paid', 'advance_amount',
                  'balance_amount', 'qr_code', 'status', 'created_at']
    
    def get_advance_amount(self, obj):
        return obj.advance_paid
    
    def get_balance_amount(self, obj):
        return obj.total_amount - obj.advance_paid