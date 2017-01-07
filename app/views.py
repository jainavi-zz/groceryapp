from django import http
from django.template import loader
from django.shortcuts import render_to_response

def index(request):
	return render_to_response("index.html")

def contact(request):
	return render_to_response("contact.html")
