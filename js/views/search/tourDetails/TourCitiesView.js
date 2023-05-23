define([
'jquery',
'underscore',
'backbone',
'marionette',
'app',
'util/animationUtil',
'services/searchService',
'event.aggregator',
'collections/tour/cities/TourCityItemCollection',
'views/search/tourDetails/TourCityItemView',
'text!templates/search/tourDetails/CitiesDetailsTemplate.html'
], function ($, _, Backbone, Marionette, App, AnimationUtil, SearchService, EventAggregator, TourCityItemCollection, TourCityItemView, ViewTemplate) {
	var TourCitiesView = Backbone.Marionette.CompositeView.extend({
		template: Backbone.Marionette.TemplateCache.get(ViewTemplate),
		collection: TourCityItemCollection,
		itemView: TourCityItemView,
		itemViewContainer: 'ul',

		initialize: function (options) {
			var self = this;
			this.model = options.model;
			var collection = new TourCityItemCollection();
			if (options.cities) {
				collection.initFromArray(options.cities);
			}
			this.collection = collection;
		},

		events: {
			'click li a': 'setNewFilter',
			'change .section-description select': 'getCities'
		},
		ui: {
			'$cityList': '.section-description select'
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

		getCities: function (event) {
			console.log("getCities - start");
			var self = this;
			var options = $(event.target).find("option:selected");
			var params = { "neoId": (options).data("neoid"), "currentItemId": self.model.get("tourId"), "packageDateId": (options).data("tourid") };
			self.callCityService(params);
		},
		onShow: function () {
			this.ui.$cityList.val(this.model.get("defaultItineraryId"));
		},
		callCityService: function (params, successFunction) {
			var self = this;
			AnimationUtil.startItineraryAnimation();
			setTimeout(function () {
				var successFunctionEx = function (results) {
					var coll = new TourCityItemCollection();
					coll.initFromArray(results);
					self.collection.reset(coll.models);
					if (successFunction) {
						successFunction(results);
					}
					params.citiesCollection = results;
					EventAggregator.trigger("changedTourDate", params);
				};
				var completeFn = function () {
					console.log("getCities - done");
					AnimationUtil.endItineraryAnimation();
				};
				SearchService.requestTourCitiesResults(params, successFunctionEx, completeFn);
			}, 500);
		},
		
		templateHelpers: function () {
			var outerScope = this;
			return {
				tourDates: outerScope.model.tourDatesByYear.models,
				caption: App.dictionary.get("tourRelated.TourDetails.Captions.Cities", "Cities"),
				message: App.dictionary.get("tourRelated.TourDetails.Cities.Message", "Click on a city below to update your search results with other tours that share that feature."),
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

	return TourCitiesView;
});