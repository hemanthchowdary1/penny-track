from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Expense
        fields = ['id', 'amount', 'category', 'date']
        # user is set automatically from request, not from client