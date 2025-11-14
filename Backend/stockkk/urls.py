# from django.urls import path
# from . import views

# urlpatterns = [
#     path('', views.getAllDetails, name='getting'),
#     path('addItem/', views.addItem, name='addd'),
#     path('checkItem/<str:name>/', views.checkItem, name="checkItem"),
#     path('updateItem/<str:name>/', views.updateItem, name="updateItem")
# ]


from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r'^$', views.getAllDetails, name='getting'),
    re_path(r'^addItem/?$', views.addItem, name='addd'),
    re_path(r'^checkItem/(?P<name>[^/]+)/?$', views.checkItem, name='checkItem'),
    re_path(r'^listLessIt/?$', views.listStockLess, name='stockless'),
    re_path(r'^updateItem/(?P<name>[^/]+)/?$', views.updateItem, name='updateItem'),
    re_path(r'^webhook/?$', views.webhook, name='webhook'),
    re_path(r'^join/?$', views.join_agora, name='join')
]
