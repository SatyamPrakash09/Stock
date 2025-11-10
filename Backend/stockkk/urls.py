from django.urls import path
from . import views

urlpatterns = [
    path('', views.getAllDetails, name='getting'),
    path('addItem/', views.getAllDetails, name='getting'),
    path('checkItem/<str:name>/', views.checkItem, name="checkItem"),
    path('updateItem/', views.updateItem, name="updateItem")
]
