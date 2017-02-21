from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator, MinValueValidator
from django.core import serializers
import json

class Grocery(models.Model):
	name = models.CharField(
		max_length = 200,
		blank = False,
		null = False
	)
	price = models.FloatField()

	def addGrocery(self):
		self.save()

	def __str__(self):
		self.name

class Customer(models.Model):
	name 		= models.CharField(max_length=50)
	email 		= models.EmailField(max_length=70, unique=True)
	phone 		= models.CharField(max_length=12, validators=[
					RegexValidator(regex='^.{12}$', message='Invalid phone number')
				], unique=True)
	street 		= models.CharField(max_length=70)
	house 		= models.CharField(blank=True, max_length=5)
	city 		= models.CharField(max_length=50)
	postal_code = models.CharField(max_length=10)
	password	= models.CharField(max_length=256)

	def clean(self):
		for field in ['name', 'email', 'phone', 'street', 'city', 'postal_code']:
			val = getattr(self, field)
			if val: setattr(self, field, val.strip())

	def __str__(self):
		return str(self.__dict__)

class Item(models.Model):
	name 		= models.CharField(max_length=150)
	price 		= models.FloatField(
					validators=[MinValueValidator(0.00)]
				)
	discount 	= models.FloatField(default=0.00,
					validators=[MinValueValidator(0.00)]
				)
	stock 		= models.IntegerField(default=0,
					validators=[MinValueValidator(0)]
				)

class OnlineOrder(models.Model):
	PAYMENT_OPTION = (
		(str(1), "COD"),
		(str(2), "NET_BANKING")
	)

	ORDER_STATUS = (
		(str(1), "PLACED"),
		(str(2), "READY"),
		(str(3), "Out for Delivery"),
		(str(4), "DEVLIVERED"),
		(str(5), "CANCELLED")
	)

	customer_email 		= models.EmailField(max_length=70)
	delivery_address 	= models.CharField(max_length=120)
	phone 				= models.CharField(max_length=12, validators=[
							RegexValidator(regex='^.{12}$', message='Invalid phone number')
						])
	net_bill 			= models.FloatField(
							validators=[MinValueValidator(0.00)]
						)
	net_discount 		= models.FloatField(default=0.00,
							validators=[MinValueValidator(0.00)]
						)
	currency_code		= models.CharField(max_length=3, default='EUR')
	payment_option 		= models.CharField(max_length=1, choices=PAYMENT_OPTION)
	placed_at 			= models.DateTimeField(default=timezone.now)
	status 				= models.CharField(max_length=1, choices=ORDER_STATUS, default=str(1))

	def check_essentials(self):
		essential_set 	= set(['customer_email', 'delivery_address', 'phone', 'net_bill', 'payment_option'])
		key_set			= set(self.__dict__.keys())

		return essential_set.issubset(key_set)

	def as_json(self):
		json_data = json.loads(serializers.serialize('json', [self]))
		return json_data[0]['fields']

	def __str__(self):
		return str(self.__dict__)

class OrderDescription(models.Model):
	order_id 	= models.ForeignKey(OnlineOrder)
	item_id 	= models.ForeignKey(Item)
	sequence	= models.IntegerField(default=1)
	price 		= models.FloatField()
	discount 	= models.FloatField(default=0.0)
	qty 		= models.IntegerField(default=1)

	def clean_up(self):
		for field in ['sequence', 'qty']:
			val = getattr(self, field)
			if val: setattr(self, field, int(val))

		for field in ['price', 'discount']:
			val = getattr(self, field)
			if val: setattr(self, field, float(val))

	def check_essentials(self):
		essential_set 	= set(['item_id_id', 'sequence', 'price', 'qty'])
		key_set			= set(self.__dict__.keys())

		return essential_set.issubset(key_set)

	def check_sanity(self):
		result = True

		if self.price <= 0.00:
			result = False
		elif self.discount < 0.00:
			result = False
		elif self.qty <= 0:
			result = False

		return result
