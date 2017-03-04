__author__ = 'Avinash Jain'

import pysolr

def solr_search_items(query):
	solr = pysolr.Solr('http://localhost:8983/solr/default/', timeout=10)
	results = solr.search(query, sort='id asc')

	suggestions = []

	for result in results:
		suggestion = {
			'id': result['id'],
			'title': result['text_auto'][0]
		}
		suggestions.append(suggestion)

	return suggestions
