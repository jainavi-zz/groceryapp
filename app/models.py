from django.db import models
from django.utils import timezone

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
