define([
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'util/uriUtil',
'models/search/tourDetails/TourCityModel',
'text!templates/search/tourDetails/CitiesItemTemplate.html'
], function ($, _, Backbone, Marionette, EventAggregator, App, UriUtil, TourCityModel, CityTemplate) {
	var TourCityItemView = Backbone.Marionette.ItemView.extend({
		model: TourCityModel,
		template: Backbone.Marionette.TemplateCache.get(CityTemplate),
		tagName: "li",
		initialize: function () {

		},
		templateHelpers: function () {
			var param = {};
			param[App.cities] = this.model.get("title");
			var searchUrl = '#' + UriUtil.getUriHash(param);
			return {
				searchUrl : searchUrl,
				caption: App.dictionary.get('TourRelated.TourDetails.Captions.CityLink', "Tours That Go Here"),
				isAgent: function () {
					if ($('body').data('isagent') === undefined) {
						return false;
					} else {
						return ($('body').data('isagent').toLowerCase() === "true");
					}
				}
			};
		}
	});

	return TourCityItemView;
});