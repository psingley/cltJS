define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'util/uriUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, UriUtil) {

	var FacetsVisibilityButton = Backbone.Marionette.Layout.extend({
		el: $("#PageHeaderFilter"),
		ButtonShouldBeHiddenConst: "1",
		events: {
			'click': 'showFacets'
		},

		initialize: function () {
			var outerScope = this;
			EventAggregator.on('requestResultsComplete', function () {
				outerScope.processingParameters();
			});

			EventAggregator.on('hideFacetFilterBar', function () {
				outerScope.showFilterButton();
			});

			outerScope.processingParameters();
		},

		processingParameters: function () {
			var outerScope = this;
			var showFacetsBar = UriUtil.getUrlVars().showFacets;
			if (!showFacetsBar || (showFacetsBar == outerScope.ButtonShouldBeHiddenConst)) {
				this.hideButton();
			}
		},
		showFacets: function () {
			EventAggregator.trigger('showFacetFilerBar'); //new event should be active for show facet bar            
			this.hideButton();
		},
		buttonIsVisible: true,
		hideButton: function () {			
			$(this.el).hide();
			this.buttonIsVisible = false;			
		},
		showFilterButton: function () {
			$(this.el).show();
			this.buttonIsVisible = true;			
		},

		getButtonStateObj: function () {
			var value = this.buttonIsVisible ? "0" : "1";
			return { "showFacets": value };
		}
	});

	return FacetsVisibilityButton;
});
