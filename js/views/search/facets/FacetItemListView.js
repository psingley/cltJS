
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/search/facets/FacetItemView',
    'app',
    'collections/search/facetItems/FacetItemCollection',
    'event.aggregator'
], function ($, _, Backbone, Marionette, FacetItemView, App, FacetItemCollection, EventAggregator) {
    var FacetItemListView = Backbone.Marionette.CollectionView.extend({
        collection: FacetItemCollection,
        tagName: "ul",
        itemView: FacetItemView,
        events: {
            'click li .facetItem': 'toggleFacet'
        },
        toggleFacet: function () {
            //EventAggregator.trigger('toggleSearchOption');
        }
	    /*onShowCalled: function () {
	        this.collection.each(function (facet) {
	            var defaultShowMoreLength = App.Search.searchSettings.get('defaultFacetShowMoreLength');
	            // hide all li and then show the first two
	            $('#' + facet.get('id') + ' li').hide().filter(':lt(' + defaultShowMoreLength + ')').show();

	            // append a li with text more that on click will show the rest
	            $('#' + facet.get('id')).append('<li>more</li>').find('li:last').click(function () {
	                $(this).siblings(':gt(' + defaultShowMoreLength + ')').toggle();
	            });
	        });

	        $("#refineResultsText").html(App.Search.searchSettings.get('refineResultsText'));
	    }*/
    });
    // Our module now returns our view
    return FacetItemListView;
});
