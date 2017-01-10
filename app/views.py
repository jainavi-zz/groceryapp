from django import http
from django.template import loader
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.core.exceptions import SuspiciousOperation
from django.http import JsonResponse
from app.models import Customer

def index(request):
	return render_to_response("index.html")

def contact(request):
	return render_to_response("contact.html")

def login(request):
	return render_to_response("login.html")

@csrf_exempt
def signup(request):
	if request.method == 'POST':
		response_data = {
			'status': "OK",
			'errors': []
		}
		data = request.POST.dict()
		data['password'] = make_password(data['password'])
		customer = Customer(**data)
		customer.clean()
		try:
			customer.save()
		except Exception, e:
			response_data['status'] = 'FAIL'
			response_data['errors'] = [str(e)]
		return JsonResponse(response_data)
	else:
		raise SuspiciousOperation('Bad Request!')
