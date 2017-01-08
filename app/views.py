from django import http
from django.template import loader
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

def index(request):
	return render_to_response("index.html")

def contact(request):
	return render_to_response("contact.html")

def login(request):
	return render_to_response("login.html")

@csrf_exempt
def signup(request):
	if request.method == 'POST':
		return JsonResponse({'status': 'OK'})
