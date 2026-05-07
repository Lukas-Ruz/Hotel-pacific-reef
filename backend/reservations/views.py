import uuid
import qrcode
import io
import base64
from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Reservation
from rooms.models import Room
from .serializers import ReservationCreateSerializer, ReservationDetailSerializer
from users.permissions import IsAdmin, IsEmployee

def generate_qr_code(reservation_id):
    """Genera QR code y retorna base64 para almacenar/retornar"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(f"RES-{reservation_id}")
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

class ReservationCreateView(generics.CreateAPIView):
    """POST /api/reservations/create/"""
    serializer_class = ReservationCreateSerializer
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def perform_create(self, serializer):
        room_id = serializer.validated_data['room_id']
        check_in = serializer.validated_data['check_in']
        check_out = serializer.validated_data['check_out']
        
        room = get_object_or_404(Room, id=room_id)
        
        # Calcular totales
        days = (check_out - check_in).days
        total = Decimal(str(days)) * room.price_daily
        advance = total * Decimal('0.30')
        
        # Generar código QR único
        qr_data = f"RES-{uuid.uuid4().hex[:12].upper()}"
        
        # Crear reserva
        reservation = Reservation.objects.create(
            user=self.request.user,
            room=room,
            check_in=check_in,
            check_out=check_out,
            total_days=days,
            total_amount=total,
            advance_paid=advance,
            payment_status='paid',
            qr_code=qr_data,
            status='confirmed'
        )
        
        return reservation
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservation = self.perform_create(serializer)
        
        # Generar imagen QR para retornar
        qr_image = generate_qr_code(reservation.qr_code)
        
        # Retornar reserva completa
        output_serializer = ReservationDetailSerializer(reservation)
        return Response({
            "reservation": output_serializer.data,
            "qr_image": qr_image,
            "message": "Reserva confirmada. Pague el 70% restante al check-in."
        }, status=status.HTTP_201_CREATED)

class ReservationListView(generics.ListAPIView):
    """GET /api/reservations/"""
    serializer_class = ReservationDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Reservation.objects.all().order_by('-created_at')
        elif user.role == 'employee':
            return Reservation.objects.filter(status='confirmed').order_by('-check_in')
        else:
            return Reservation.objects.filter(user=user).order_by('-created_at')

class ReservationDetailView(generics.RetrieveAPIView):
    """GET /api/reservations/{id}/"""
    serializer_class = ReservationDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'employee']:
            return Reservation.objects.all()
        return Reservation.objects.filter(user=user)

class ReservationCancelView(generics.UpdateAPIView):
    """PATCH /api/reservations/{id}/cancel/"""
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Reservation.objects.all()
        return Reservation.objects.filter(user=user, status='confirmed')
    
    def patch(self, request, *args, **kwargs):
        reservation = self.get_object()
        reservation.status = 'cancelled'
        reservation.save()
        return Response({"message": "Reserva cancelada exitosamente"})

@api_view(['POST'])
@permission_classes([IsEmployee | IsAdmin])
def validate_qr(request):
    """POST /api/reservations/validate-qr/"""
    qr_code = request.data.get('qr_code')
    if not qr_code:
        return Response({"error": "qr_code requerido"}, status=400)
    
    try:
        reservation = Reservation.objects.get(qr_code=qr_code, status='confirmed')
        return Response({
            "valid": True,
            "reservation_id": str(reservation.id),
            "guest": reservation.user.get_full_name(),
            "room": reservation.room.number,
            "check_in": reservation.check_in,
            "check_out": reservation.check_out
        })
    except Reservation.DoesNotExist:
        return Response({"valid": False, "error": "Reserva no encontrada"}, status=404)