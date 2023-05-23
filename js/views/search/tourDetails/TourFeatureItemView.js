define([
'jquery',
'underscore',
'app',
'backbone',
'marionette',
'event.aggregator',
'models/search/tourDetails/TourFeaturesModel',
'util/uriUtil',
'text!templates/search/tourDetails/TourFeatureItemTemplate.html'
], function ($, _, App, Backbone, Marionette, EventAggregator, TourFeaturesModel, UriUtil, ViewTemplate) {
	var TourFeaturesView = Backbone.Marionette.ItemView.extend({
		model: TourFeaturesModel,
		template: Backbone.Marionette.TemplateCache.get(ViewTemplate),
		tagName: "li",
		initialize: function () {
		},
		templateHelpers: function () {
			var param = {};
			param[App.tourFeaturesFacet] = this.model.get("title");
			var searchUrl = '#' + UriUtil.getUriHash(param);
			return {
				searchUrl: searchUrl,
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

	return TourFeaturesView;
});