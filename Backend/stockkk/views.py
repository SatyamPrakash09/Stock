from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.
def getAllDetails(request):
    return JsonResponse({"Hello": "Shinchan"})

def addItem(request):
    return JsonResponse({"Hello": "Shinchan"})

def checkItem(request, name):
    return JsonResponse({"Hello": "Shinchan"})

def updateItem(request, name):
    return JsonResponse({"Hello": "Shinchan"})

def setReorder(request):
    return JsonResponse({"Hello": "Shinchan"})

def expiryorNot(request):
    return JsonResponse({"Hello": "Shinchan"})