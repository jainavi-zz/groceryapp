from django import http
from django.template import loader
from django.shortcuts import render_to_response, render
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import SuspiciousOperation
from django.db import transaction
from django.db import IntegrityError
from django.http import JsonResponse
from django.contrib.auth.models import User
from app.models import Customer, UserProfile
from app.models import Item
from app.models import OnlineOrder
from app.models import ForgotPassword
import app.utils as utils
from app.search import solr_search_items
import json
import os
import binascii

def index(request):
	return render_to_response("index.html")

def contact(request):
	return render_to_response("contact.html")

def login(request):
	if request.method == 'GET':
		return render(request, "login.html", {})
	elif request.method == 'POST':
		data = request.POST.dict()
		username = data['username'].strip()
		password = data['password']

		response_data = {
			'status': "OK",
			'errors': [],
			'data': {}
		}

		user = authenticate(username=username, password=password)

		if user is None:
			response_data['status'] = 'FAIL'
			response_data['errors'] = 'Invalid email or password!'
		else:
			auth_login(request, user)
			response_data['data'] = str(user.userprofile)

		return JsonResponse(response_data)
	else:
		raise SuspiciousOperation('Bad Request!')

@transaction.atomic
def signup(request):
	if request.method == 'POST':
		response_data = {
			'status': "OK",
			'errors': [],
			'data': {}
		}

		data = request.POST.dict()

		email = data['email'].strip()
		password = make_password(data['password'])

		# Removing unwanted fields to create profile object
		[ data.pop(key, None) for key in ['email', 'password', 'csrfmiddlewaretoken'] ]

		user = User(username=email, password=password)
		user.user_profile_data = utils.strip_dict_data(data)
		try:
			user.save()
		except Exception, e:
			response_data['status'] = 'FAIL'
			response_data['errors'] = [str(e)]
		return JsonResponse(response_data)
	else:
		raise SuspiciousOperation('Bad Request!')

@csrf_exempt
def order(request):
	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))

		order_summary_data = data['order_summary']
		order_description_data = data['order_description']

		if order_summary_data is None or order_description_data is None:
			raise SuspiciousOperation('Bad Request!')

		online_order = OnlineOrder(**order_summary_data)
		online_order.status = str(1)

		if not online_order.check_essentials():
			raise SuspiciousOperation('Bad Request!')

		sequence = 1
		net_bill = 0.00
		order_descriptions = []

		response_data = {
			'status': 'OK',
			'errors': [],
			'data': {}
		}

		for description in order_description_data:
			item = Item.objects.get(pk=description['item_id'])

			if item is None:
				raise SuspiciousOperation(description['item_id'] + ' does not exist!')

			description['item_id'] = item
			order_description = utils.prepare_order_description(description, sequence)
			if order_description is None:
				raise SuspiciousOperation('Bad Request!')

			if item.price != order_description.price or item.discount != order_description.discount:
				response_data['status'] = 'FAIL'
				response_data['errors'].append('Price is not matching for item ' + item.name)
			else:
				net_bill += (item.price - item.discount) * order_description.qty
				order_descriptions.append(order_description)

			sequence += 1

		if net_bill != online_order.net_bill:
			response_data['status'] = 'FAIL'
			response_data['errors'].append('Inconsistency in net bill price!')

		if len(response_data['errors']) == 0:
			try:
				with transaction.atomic():
					online_order.save()
					for order_description in order_descriptions:
						order_description.order_id = online_order
						order_description.save()
			except IntegrityError, e:
				response_data['status'] = 'FAIL'
				response_data['errors'] = [str(e)]

		return JsonResponse(response_data)

@csrf_exempt
def checkout(request):
	if request.method == 'GET':
		return render_to_response("checkout.html")
	elif request.method == 'POST':
		return {}

@csrf_exempt
def trackmyorder(request):
	if request.method == 'GET':
		return render_to_response("trackmyorder.html")
	elif request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))

		customer_email = data['email']
		order_id = data['order_id']

		if customer_email is None or order_id is None:
			raise SuspiciousOperation('Bad Request!')

		response_data = {
			'status': 'OK',
			'errors': [],
			'data': {}
		}

		order = OnlineOrder.objects.filter(id=order_id, customer_email=customer_email).first()
		if order is None:
			response_data['status'] = 'FAIL'
			response_data['errors'] = ['We could not find any order with the above parameters']
		else:
			response_data['data'] = order.as_json()

		return JsonResponse(response_data)

def password_forgot(request):
	if request.method == 'POST':
		email = request.POST.get('email', "").strip()

		response_data = {
			'status': 'OK',
			'errors': [],
			'data': {}
		}

		if Customer.objects.filter(email=email).exists():
			access_token = str(binascii.hexlify(os.urandom(64)))
			attr = {}
			attr['email'] = email
			attr['access_token'] = access_token
			forgot_password = ForgotPassword(**attr)
			try:
				ForgotPassword.objects.filter(email=email, is_expired=0).update(is_expired=1)
				forgot_password.save()
				scheme = 'https' if request.is_secure() else 'http'
				domain = request.get_host()
				base_url = scheme + '://' + domain
				utils.send_reset_password_link(email, access_token, base_url)
			except Exception, e:
				response_data['status'] = 'FAIL'
				response_data['errors'] = [str(e)]
		else:
			response_data['status'] = 'FAIL'
			response_data['errors'] = 'You are not registered with us. Please sign up!'

		return JsonResponse(response_data)
	else:
		raise SuspiciousOperation('Bad Request!')

def password_reset(request, access_token):
	if request.method == 'GET':
		forgot_password = ForgotPassword.objects.filter(access_token=access_token).first()
		if forgot_password.is_token_valid():
			return render(request, "password_reset.html", { 'access_token': access_token })
		else:
			return render(request, "login.html", { 'link_expired': 1 })
	else:
		raise SuspiciousOperation('Bad Request!')

def reset_password(request):
	if request.method == 'POST':
		access_token = request.POST.get('access_token', "").strip()
		new_password = request.POST.get('new_password')

		response_data = {
			'status': 'FAIL',
			'errors': [],
			'data': {}
		}

		forgot_password = ForgotPassword.objects.filter(access_token=access_token).first()

		if forgot_password is None:
			response_data['errors'] = ['Invalid access token']
		elif forgot_password.is_token_expired():
			response_data['errors'] = ['The link is expired. Please request a new reset link']
		elif len(new_password) < 5:
			response_data['errors'] = ['Password should be at-least 5 characters long']
		else:
			try:
				customer = Customer.objects.get(email=forgot_password.email)
				customer.password = make_password(new_password)
				forgot_password.is_expired = 1
				with transaction.atomic():
					customer.save()
					forgot_password.save()
				response_data['status'] = 'OK'
			except IntegrityError, e:
				response_data['errors'] = [str(e)]

		return JsonResponse(response_data)
	else:
		raise SuspiciousOperation('Bad Request!')

def search_items(request):
	if request.method == 'GET':
		query = request.GET.get('query', '')
		result = solr_search_items(query)

		response_data = {
			'status': 'OK',
			'data': result
		}

		return JsonResponse(response_data)
	else:
		raise SuspiciousOperation('Bad Request!')
