from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.
@api_view(['GET', 'POST'])
def hello_world(request):
    if request.method == 'POST':
        print(request.data)
        return Response({"data": "ID: 222 3829 333982"})
    else:
        return Response({"message": ["Hello, world!","Hello, world!","Hello, world!","Hello, world!","Hello, world!","Hello, world!"]})
