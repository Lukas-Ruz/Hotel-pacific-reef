from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsEmployee(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['employee', 'admin']

class IsBookingAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['booking_admin', 'admin']

class IsOwnerOrAdmin(permissions.BasePermission):
    
    # Para que usuarios solo vean sus propios datos, admins ven todos
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.id == request.user.id