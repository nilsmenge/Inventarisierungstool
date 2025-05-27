from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import User, Asset

#############
### USERS ###
#############

class UserAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            last_name="Mustermann",
            first_name="Max",
            department="IT",
            email="max@mustermann.de",
            password="test123"
        )

    def test_get_users(self):
        url = reverse('get_users')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_create_user(self):
        url = reverse('create_user')
        data = {
            "last_name": "Test",
            "first_name": "User",
            "department": "HR",
            "email": "test@user.de",
            "password": "pw123"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)

    def test_user_detail_get(self):
        url = reverse('user_detail', args=[self.user.email])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)

    def test_user_detail_put(self):
        url = reverse('user_detail', args=[self.user.email])
        data = {
            "last_name": "Neu",
            "first_name": "Max",
            "department": "IT",
            "email": self.user.email,
            "password": "test123"
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.last_name, "Neu")

    def test_user_detail_delete(self):
        url = reverse('user_detail', args=[self.user.email])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(email=self.user.email).exists())

##############
### ASSETS ###
##############

class AssetAPITests(APITestCase):
    def setUp(self):
        self.asset = Asset.objects.create(
            serial_no="123456",
            device_name="Laptop",
            category="IT"
        )

    def test_get_assets(self):
        url = reverse('get_assets')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_create_asset(self):
        url = reverse('create_asset')
        data = {
            "serial_no": "654321",
            "device_name": "Monitor",
            "category": "IT"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Asset.objects.count(), 2)

    def test_asset_detail_get(self):
        url = reverse('asset_detail', args=[self.asset.serial_no])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['serial_no'], self.asset.serial_no)

    def test_asset_detail_put(self):
        url = reverse('asset_detail', args=[self.asset.serial_no])
        data = {
            "serial_no": self.asset.serial_no,
            "device_name": "Notebook",
            "category": "IT"
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.asset.refresh_from_db()
        self.assertEqual(self.asset.device_name, "Notebook")

    def test_asset_detail_delete(self):
        url = reverse('asset_detail', args=[self.asset.serial_no])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Asset.objects.filter(serial_no=self.asset.serial_no).exists())
