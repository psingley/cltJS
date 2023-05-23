define([
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'models/search/tourDetails/TourActivityLevelModel',
'text!templates/search/tourDetails/TourActivityLevelTemplate.html'
], function ($, _, Backbone, Marionette, EventAggregator,App, TourActivityLevelModel, ViewTemplate) {
	var TourActivityLevelView = Backbone.Marionette.ItemView.extend({
		template: Backbone.Marionette.TemplateCache.get(ViewTemplate),
		
		initialize: function (options) {
		
		},
		templateHelpers: function () {
			var outerScope = this;
			return {				
				caption: App.dictionary.get("tourRelated.TourDetails.Captions.ActivityLevel", "Activity Level"),
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

	return TourActivityLevelView;
});