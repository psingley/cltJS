define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'text!templates/tourDetailPage/tourDates/yearTabTemplate.html',
    'models/tourDetailPage/tourDates/TourDatesByYearModel'
], function ($, _, Backbone, Marionette, App, YearTabTemplate, TourDatesByYearModel) {
	var YearTabView = Backbone.Marionette.ItemView.extend({
		model: TourDatesByYearModel,
		template: Backbone.Marionette.TemplateCache.get(YearTabTemplate),
		templateHelpers: function () {
			return {
				year: this.model.get("year")
			}
		}
	});
	// Our module now returns our view
	return YearTabView;
});
