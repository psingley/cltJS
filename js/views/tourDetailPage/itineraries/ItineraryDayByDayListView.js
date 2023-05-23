define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'collections/tourDetailPage/itineraries/ItineraryItemCollection',
		'views/tourDetailPage/itineraries/ItineraryDayByDayItemView'
],
	function ($,
		_,
		Backbone,
		Marionette,
		App,
		ItineraryItemCollection,
		ItineraryDayByDayItemView) {
		var ItineraryDayByDayListView = Backbone.Marionette.CollectionView.extend({
			collection: ItineraryItemCollection,
			itemView: ItineraryDayByDayItemView,
			initialize: function () { },
			onShow: function () {

				$('#fullItinerary').show();

			}
		});

		return ItineraryDayByDayListView;
	});