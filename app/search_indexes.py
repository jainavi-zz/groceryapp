# from haystack import indexes
# from app.models import Item

# class ItemIndex(indexes.SearchIndex, indexes.Indexable):
# 	text = indexes.CharField(document=True, use_template=True, model_attr='name')
# 	# We add this for autocomplete.
# 	text_auto = indexes.EdgeNgramField(model_attr='name')

# 	def get_model(self):
# 		return Item

# 	def index_queryset(self, using=None):
# 		"""Used when the entire index for model is updated."""
# 		return self.get_model().objects.all()
