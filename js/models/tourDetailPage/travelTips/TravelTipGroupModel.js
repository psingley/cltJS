// Filename: models/facetItems
define([
		'jquery',
		'underscore',
		'backbone',
		'collections/tourDetailPage/travelTips/TravelTipCollection',
		'models/tourDetailPage/travelTips/TravelTipModel'
	],
	function($, _, Backbone, TravelTipCollection, TravelTipModel) {
		var TravelTipGroupModel = Backbone.Model.extend({
			defaults: {
				category: '',
				travelTips: TravelTipCollection
			},
			initialize: function() {
				this.travelTips = new TravelTipCollection();
				this.fetchCollections();
			},
			fetchCollections: function() {
				//when we call fetch for the model we want to fill its collections
				this.travelTips.set(
					_(this.get("travelTips")).map(function(travelTip) {
						return new TravelTipModel(travelTip);
					})
				);
			}
		});
		// Return the model for the module
		return TravelTipGroupModel;
	});
