from django import http
from django.template import loader
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import SuspiciousOperation
from django.http import JsonResponse
from app.models import Customer
import json

def index(request):
	return render_to_response("index.html")

def contact(request):
	return render_to_response("contact.html")

@csrf_exempt
def login(request):
	if request.method == 'GET':
		return render_to_response("login.html")
	elif request.method == 'POST':
		email = request.POST['email'].strip()
		password = request.POST['password']

		customer = Customer.objects.get(email=email)

		response_data = {
			'status': "OK",
			'errors': [],
			'data': {}
		}

		if customer is None:
			response_data['status'] = 'FAIL'
			response_data['errors'] = 'Invalid email id!'
		elif check_password(password, customer.password) == False:
			response_data['status'] = 'FAIL'
			response_data['errors'] = 'Invalid password!'
		else:
			response_data['data'] = str(customer)

		return JsonResponse(response_data)

	else:
		raise SuspiciousOperation('Bad Request!')

@csrf_exempt
def signup(request):
	if request.method == 'POST':
		response_data = {
			'status': "OK",
			'errors': [],
			'data': {}
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
