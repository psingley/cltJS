define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'models/tourDetailPage/travelTips/TravelTipModel',
		'text!templates/tourDetailPage/travelTips/travelTipTemplate.html'
	],
	function($, _, Backbone, Marionette, TravelTipModel, travelTipFullTemplate) {
		var TravelTipView = Backbone.Marionette.ItemView.extend({
			model: TravelTipModel,
			template: Backbone.Marionette.TemplateCache.get(travelTipFullTemplate),
			intialize: function() {
			},
			templateHelpers: function() {

				return{
					tip: this.model.attributes.get('tip')
			};
			}

		});
// Our module now returns our view
		return TravelTipView;
	});
