from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializer import UserSerializer


@api_view(['GET'])
def get_user(request):
    return Response(UserSerializer({'last_name': "user", 
                                    'first_name': "test", 
                                    'department': "OE17", 
                                    'email': "tuser@inventool.com", 
                                    'password': "abc123"}).data)