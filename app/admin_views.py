#!/usr/bin/python

__author__ 		= "Avinash Jain"
__version__ 	= "1.0.1"
__email__ 		= "jain.avi17@gmail.com"

from django.conf.urls import url, patterns
from django.contrib import admin
from django.shortcuts import render_to_response, render
from django.contrib.admin.views.decorators import staff_member_required

@staff_member_required
def test(request):
    return render(request, 'admin/app/test.html', {})
