#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__      = "Avinash Jain"

from app.models import OrderDescription
from django.core.mail import EmailMessage

def prepare_order_description(data, sequence):
	order_description = OrderDescription(**data)
	order_description.clean_up()
	order_description.sequence = sequence

	if not order_description.check_essentials():
		return None

	if not order_description.check_sanity():
		return None

	return order_description

def send_reset_password_link(email, access_token, base_url):
	subject 	= '[GroceryApp] Please reset your password'
	body		= """
					<p>We heard that you lost your GroceryApp password. Sorry about that!</p>
					<p>But don’t worry! You can use the following link within the next day to reset your password:</p>
					<p><a href="%s/password_reset/%s">%s/password_reset/%s</a></p>
					<p>If you don’t use this link within 24 hours, it will expire. To get a new password reset link, visit
						<a href="%s/login">%s/login</a>
					</p>
					<p>
						Thanks,<br>
						Your friends at GroceryApp
					</p>
				""" % (base_url, access_token, base_url, access_token, base_url, base_url)
	from_email 	= 'jain.avi17@gmail.com'
	to_email	= [email]
	reply_to	= ['noreply@groceryapp.de']

	email = EmailMessage(subject, body, from_email, to_email, reply_to=reply_to)
	email.content_subtype = "html"
	email.send()
