
define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'event.aggregator',
		'views/tourDetailPage/travelTips/TravelTipGroupView',
		'collections/tourDetailPage/travelTips/TravelTipGroupCollection'
	],
	function($, _, Backbone, Marionette, App, EventAggregator, TravelTipGroupView, TravelTipGroupCollection) {
		var TravelTipListView = Backbone.Marionette.CollectionView.extend({
			collection: TravelTipGroupCollection,
			itemView: TravelTipGroupView,
			onShow: function () {
				$('#tipsTitle').show();
				$('#tourTravelTips').show();
			}
		});
		// Our module now returns our view
		return TravelTipListView;
	});
