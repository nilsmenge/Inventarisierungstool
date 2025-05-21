from django.db import models

# Create your models here.
class User(models.Model):
    last_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    email = models.EmailField(max_length=254)
    password = models.CharField(max_length=32)
    


    def __str__(self):
        return self.last_name, self.first_name