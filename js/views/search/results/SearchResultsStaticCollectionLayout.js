
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/search/results/SearchResultItemView',
    'collections/search/results/ResultCollection',
    'event.aggregator',
    // Using the Require.js text! plugin, we are loaded raw text
    // which will be used as our views primary template
    'text!templates/search/results/searchResultListTemplate.html',
	'renderedLayouts/customerLead/RequestAQuoteModalLayout'
], function ($, _, Backbone, Marionette, App, SearchResultItemView, ResultCollection, EventAggregator, resultListTemplate, RequestAQuoteModalLayout) {
	var SearchResultsStaticCollectionLayout = Backbone.Marionette.CompositeView.extend({
		template: Backbone.Marionette.TemplateCache.get(resultListTemplate),
		itemView: SearchResultItemView,
		events: {
			'click #viewMoreText': 'redirectToSearchPage'
		},
		initialize: function (options) {
			var self = this;
			self.performSearch = options.performSearch;
			self.searchParams = options.searchParams;			
			this.collection = self.performSearch.results;			
			//show hide bar			
		},
		redirectToSearchPage: function () {
			window.location = '/en/find-your-tour#q/' + this.searchParams;
		},
		itemViewOptions: function (model, index) {
			return {
				resultNumber: index + 1
			}
		},		
		appendHtml: function (collectionView, itemView, indexw) {
			// ensure we nest the child list inside of
			// the current list item
			collectionView.$("#searchResult:last").append(itemView.el);
		},
		templateHelpers: function() {
			return {
				closeText: App.dictionary.get('common.Buttons.Close'),
				learnMoreText: App.Search.searchSettings.get("SeeDetailsMessage")
			}
		}
	});
	// Our module now returns our view
	return SearchResultsStaticCollectionLayout;
});
