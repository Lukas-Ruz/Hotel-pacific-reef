from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime
from .models import Room
from reservations.models import Reservation
from .serializers import RoomListSerializer, RoomDetailSerializer

class RoomListView(generics.ListAPIView):
    
    # GET /api/rooms/
    
    serializer_class = RoomListSerializer
    permission_classes = [AllowAny]  # Catalogo publico
    
    def get_queryset(self):
        queryset = Room.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset

@api_view(['GET'])
@permission_classes([AllowAny])
def check_availability(request):
   
    # GET de ejemplo /api/rooms/availability/?check_in=15-01-2024&check_out=18-01-2024&category=premium

    check_in_str = request.query_params.get('check_in')
    check_out_str = request.query_params.get('check_out')
    category = request.query_params.get('category')
    
    # Validación de parámetros
    if not check_in_str or not check_out_str:
        return Response(
            {"error": "Se requieren check_in y check_out"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        check_in = datetime.strptime(check_in_str, '%d-%m-%Y').date()
        check_out = datetime.strptime(check_out_str, '%d-%m-%Y').date()
    except ValueError:
        return Response(
            {"error": "Formato de fecha inválido. Use DD-MM-YYYY"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if check_out <= check_in:
        return Response(
            {"error": "check_out debe ser posterior a check_in"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Query habitaciones activas
    available_rooms = Room.objects.filter(is_active=True)
    
    if category:
        available_rooms = available_rooms.filter(category=category)
    
    # EXCLUIR habitaciones con reservas CONFIRMADAS que se solapen con el rango solicitado
    # Lógica de una reserva existe si:
    # (check_in_reserva < check_out_solicitado) AND (check_out_reserva > check_in_solicitado)
    
    conflicting_reservations = Reservation.objects.filter(
        status='confirmed',
        check_in__lt=check_out,
        check_out__gt=check_in
    ).values_list('room_id', flat=True)
    
    available_rooms = available_rooms.exclude(id__in=conflicting_reservations)
    
    # Calcular precio total para el período
    days = (check_out - check_in).days
    rooms_data = []
    for room in available_rooms:
        room.total_price = days * room.price_daily
        room.is_available = True
        rooms_data.append(room)
    
    serializer = RoomListSerializer(rooms_data, many=True)
    return Response({
        "check_in": check_in_str,
        "check_out": check_out_str,
        "nights": days,
        "available_count": len(rooms_data),
        "rooms": serializer.data
    })

class RoomDetailView(generics.RetrieveAPIView):
    
    # GET /api/rooms/{id}/ detalle
    
    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'