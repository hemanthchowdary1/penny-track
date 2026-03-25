from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Expense
from .serializers import ExpenseSerializer

# Expense CRUD — only current user's expenses
class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class   = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Each user only sees their own expenses
        return Expense.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        # Automatically attach logged-in user when saving
        serializer.save(user=self.request.user)


# Register new user
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()
    email    = request.data.get('email', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken.'}, status=400)

    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({'message': f'Account created for {user.username}!'}, status=201)