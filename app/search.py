__author__ = 'Avinash Jain'

import os
import pysolr

def solr_search_items(query):
	if 'SERVER_PROD' in os.environ:
		solr_url = 'http://ec2-34-207-179-25.compute-1.amazonaws.com:8983/solr/default/'
	else:
		solr_url = 'http://localhost:8983/solr/default/'

	solr = pysolr.Solr(solr_url, timeout=10)
	results = solr.search(query, sort='id asc')

	suggestions = []

	for result in results:
		suggestion = {
			'item_id': result['id'],
			'item_name': result['text_auto'][0]
		}
		suggestions.append(suggestion)

	return suggestions
