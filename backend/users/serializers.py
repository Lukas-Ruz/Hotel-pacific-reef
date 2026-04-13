from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'id_document']
        extra_kwargs = {'password': {'write_only': True}}

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone', 'id_document', 'role']
        extra_kwargs = {'role': {'default': 'client'}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user