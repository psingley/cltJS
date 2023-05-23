define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'util/uriUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, UriUtil) {

	var FilterFacetBar = Backbone.Marionette.Layout.extend({
		el: $("#filterBar"),
		FilterBarShuldBeHidden: "0",
		ui: {

		},
		events: {
			'click #hideFiltersBtn': 'hideFacetFilterBar',
			'click #moreFiltersBtn': 'filtersExClick'
		},

		initialize: function () {
			var outerScope = this;
			EventAggregator.on('requestResultsComplete', function () {
				outerScope.processingParameters();
				outerScope.checkButtonVisibilityState();
			});

			EventAggregator.on('showFacetFilerBar', function () {
				outerScope.showFilterBar();
			});
			outerScope.checkButtonVisibilityState();
			outerScope.processingParameters();
		},

		checkButtonVisibilityState: function () {
			var hiddenlength = 0;
			$(this.el).find("#more-filters").children().each(function()
			{
				if ($(this).css("display") == 'none') {
					hiddenlength++;
				}
			});
			var totallength = $(this.el).find("#more-filters").children().length;
			if (hiddenlength == totallength) {
				$(this.el).find("#moreFiltersBtn").hide();
			} else {
				$(this.el).find("#moreFiltersBtn").show();
			}
		},
		processingParameters: function () {
			var outerScope = this;
			var showFacetsBar = UriUtil.getUrlVars().showFacets;
			if (showFacetsBar && (showFacetsBar == outerScope.FilterBarShuldBeHidden)) {
				this.hideFacetFilterBar();
			}
		},
		filtersExClick: function () {
			var message = "";
			if ($(this.el).find("#more-filters.filters.collapse").not(".in").length > 0) {
				message = $("#moreFiltersBtn").data("lessfilters");
			} else {
				message = $("#moreFiltersBtn").data("morefilters");
			}
			$("#moreFiltersBtn").html('<i class="fa fa-sliders"></i>'+message);
		},
		hideFacetFilterBar: function () {
			$(this.el).hide();
			EventAggregator.trigger('hideFacetFilterBar');
		},

		showFilterBar: function () {
			$(this.el).show();		
		}		
	});

	return FilterFacetBar;
});
