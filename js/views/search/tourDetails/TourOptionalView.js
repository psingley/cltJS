define([
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'models/search/tourDetails/TourOptionalModel',
'text!templates/search/tourDetails/TourOptionalTemplate.html'
], function ($, _, Backbone, Marionette, EventAggregator, TourOptionalModel, ViewTemplate) {
	var TourOptionalView = Backbone.Marionette.ItemView.extend({
		model: TourOptionalModel,
		template: Backbone.Marionette.TemplateCache.get(ViewTemplate),
		initialize: function () {

		},
	});

	return TourOptionalView;
});