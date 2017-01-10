from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator

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
		self.__dict__
