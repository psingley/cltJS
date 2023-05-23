define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'collections/tourDetailPage/itineraries/ItineraryItemCollection',
		'views/tourDetailPage/itineraries/ItineraryDescriptionItemView'
	],
	function ($,
		_,
		Backbone,
		Marionette,
		App,
		ItineraryItemCollection,
		ItineraryDescriptionItemView) {
		var ItineraryDescriptionListView = Backbone.Marionette.CollectionView.extend({
			collection: ItineraryItemCollection,
			itemView: ItineraryDescriptionItemView,
			initialize: function () { },
			onShow: function () {
				var dayAccordion = $('.day-accordion');
				_.each(dayAccordion,
					function(day) {
						var val = $(day).data();
						if (val.day == "1" || val.day == "1 - 2") {
							$(day).addClass("day-selected");
						}
					});

			}
		});

		return ItineraryDescriptionListView;
	});