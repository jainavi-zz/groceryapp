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
	email 		= models.EmailField(max_length=70, primary_key=True)
	phone 		= models.CharField(max_length=12, validators=[
					RegexValidator(regex='^.{4}$', message='Invalid phone number')
				], unique=True)
	street 		= models.CharField(max_length=70)
	house 		= models.CharField(max_length=5)
	city 		= models.CharField(max_length=50)
	postal_code = models.CharField(max_length=5)
	password	= models.CharField(max_length=30)
