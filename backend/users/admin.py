from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'role', 'is_staff', 'created_at']
    list_filter = ['role', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Información Hotel', {'fields': ('role', 'phone', 'id_document')}),
    )