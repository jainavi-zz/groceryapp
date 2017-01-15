#!/usr/bin/env python

__author__      = "Avinash Jain"

from app.models import OrderDescription

def prepare_order_description(data, sequence):
	order_description = OrderDescription(**data)
	order_description.clean_up()
	order_description.sequence = sequence

	if not order_description.check_essentials():
		return None

	if not order_description.check_sanity():
		return None

	return order_description
