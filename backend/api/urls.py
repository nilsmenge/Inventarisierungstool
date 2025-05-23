from django.urls import path
from .views import get_users, create_user, user_detail, get_assets, create_asset, asset_detail

urlpatterns = [
    path('users/', get_users, name='get_users'),
    path('users/create/', create_user, name='create_user'),
    path('users/<int:pk>/', user_detail, name='user_detail'),
    path('assets/', get_assets, name='get_assets'),
    path('assets/create/', create_asset, name='create_asset'),
    path('assets/<int:pk>/', asset_detail, name='asset_detail')
]