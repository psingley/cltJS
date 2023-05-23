
define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'event.aggregator',
		'views/tourDetailPage/travelTips/TravelTipView',
		'collections/tourDetailPage/travelTips/TravelTipCollection'
	],
	function($, _, Backbone, Marionette, App, EventAggregator, TravelTipView, TravelTipCollection) {
		var TravelTipListView = Backbone.Marionette.CollectionView.extend({
			collection: TravelTipCollection,
			itemView: TravelTipView,
			itemViewOptions: function () {
				return { parent: 'travelTip' };
			}
		});
		// Our module now returns our view
		return TravelTipListView;
	});

