define([
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'collections/tour/features/TourFeaturesCollection',
'views/search/tourDetails/TourFeatureItemView',
'text!templates/search/tourDetails/TourFeaturesTemplate.html'
], function ($, _, Backbone, Marionette, EventAggregator,App, FeaturesCollection, TourFeatureItemView, ViewTemplate) {
	var TourFeaturesView = Backbone.Marionette.CompositeView.extend({
		template: Backbone.Marionette.TemplateCache.get(ViewTemplate),
		collection: FeaturesCollection,
		itemView: TourFeatureItemView,
		itemViewContainer: 'ul',
		events: {
			'click li a': 'setNewFilter'
		},
		setNewFilter: function () {
			$('html,body').animate({
				scrollTop: $('#main').offset() ? $('#main').offset().top : 0
			}, "slow");

			var activeTourId = $(App.searchResultsRegion.el).find('.tour-active').data('tourid');
			if (activeTourId) {
				App.Search.ActiveResult = App.searchResultsRegion.currentView.collection.where({ id: activeTourId })[0];
			}

			App.Search.searchOptions.set({ currentPage: 1 });
		},
		initialize: function (options) {
			var self = this;
			this.model = options.model;
			var collection = new FeaturesCollection();
			collection.initFromArray(options.features);
			this.collection = collection;
		},
		templateHelpers: function () {
			var outerScope = this;
			return {
				tourDates: outerScope.model.tourDatesByYear.models,
				caption: App.dictionary.get("tourRelated.TourDetails.Captions.Features", "Features"),
				message: App.dictionary.get("tourRelated.TourDetails.Features.Message", "Click on a feature below to update your search results with other tours that share that feature."),
				isAgent: function () {
					if ($('body').data('isagent') === undefined) {
						return false;
					} else {
						return ($('body').data('isagent').toLowerCase() === "true");
					}
				}
			}
		}
	});

	return TourFeaturesView;
});