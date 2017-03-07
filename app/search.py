__author__ = 'Avinash Jain'

import pysolr
from django.conf import settings

def solr_search_items(query):
	solr = pysolr.Solr(settings.SOLR_CONN, timeout=10)
	results = solr.search(query, sort='id asc')

	suggestions = []

	for result in results:
		suggestion = {
			'item_id': result['id'],
			'item_name': result['text_auto'][0]
		}
		suggestions.append(suggestion)

	return suggestions
