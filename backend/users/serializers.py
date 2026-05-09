from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'id_document']
        extra_kwargs = {'password': {'write_only': True}}

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.CharField(read_only=True)
    email = serializers.EmailField(required=True, max_length=254)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone', 'id_document', 'role']
    
    def create(self, validated_data):
        validated_data['role'] = 'client'
        validated_data['username'] = validated_data['email']
        user = User.objects.create_user(**validated_data)
        return user
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado")
        if len(value) > 254:  # ← AGREGAR validación explícita
            raise serializers.ValidationError("El correo no puede exceder 254 caracteres")
        return value
    
    def validate_first_name(self, value):
        import html
        return html.escape(value)
    
    def validate_last_name(self, value):
        import html
        return html.escape(value)