from django.db import models
from django.contrib.auth.models import User

class Expense(models.Model):
    user     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    amount   = models.FloatField()
    category = models.CharField(max_length=50)
    date     = models.DateField()

    def __str__(self):
        return f"{self.user.username} - {self.category} - {self.amount}"