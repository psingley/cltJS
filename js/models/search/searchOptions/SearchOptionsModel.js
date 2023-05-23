// Filename: models/project
define([
		'underscore',
		'backbone',
		'collections/search/searchOptions/ParameterCollection',
		'models/search/searchOptions/ParameterModel'
	],
	function(_, Backbone, ParameterCollection, ParameterModel) {
		var SearchOptionsModel = Backbone.Model.extend({
			defaults: {
				parameters: ParameterCollection,
				currentItemId: null,
				sortBy: '',
				sortDirection: 'desc',
				resultsOnFirstPage: 12,
				numberOfAdditionalResultsPerPage: 12,
				currentPage: 1,
				//returns all results up to the given page, set to true for first page load
				returnAllResults: true,
				getPreviousNext: false,
				//for keyword search
				content: '',
				filterFieldNames: [],
				key: '',
				contactId: $('body').data('contactid'),
				siteLang: $('.grid-page').attr('data-language')
			}
		});
		// Return the model for the module
		return SearchOptionsModel;
	});