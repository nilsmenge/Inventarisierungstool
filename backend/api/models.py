from django.db import models

# Create your models here.
class User(models.Model):
    last_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    email = models.CharField(max_length=254)
    password = models.CharField(max_length=32)

    def __str__(self):
        return f"{self.last_name}, {self.first_name}"

    #def __str__(self):
    #    return self.last_name, self.first_name


class Asset(models.Model):
    serial_no = models.CharField(max_length=100)
    device_name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)

    # Optional field for the asset label
    # lable = models.CharField(max_length=100, blank=True, null=True)
    # manufacturer = models.CharField(max_length=100)
    # status = models.CharField(max_length=100)
    # location = models.CharField(max_length=100)
    # qrcode = models.CharField(max_length=100, blank=True, null=True)
    # barcode = models.CharField(max_length=254, blank=True, null=True)
    # modell = models.CharField(max_length=32)
    # modell_description = models.CharField(max_length=32)
    # original_id = models.CharField(max_length=32)
    # original_key = models.CharField(max_length=32)
    # created_date = models.DateTimeField(auto_now_add=True)
    # created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    # end_of_life = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.serial_no