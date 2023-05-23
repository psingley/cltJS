define([
		'app',
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout',
		'event.aggregator',
		'services/searchService',
		'renderedLayouts/search/TourDetailsLayout'
], function (App, $, _, Backbone, Marionette, RenderedLayout, EventAggregator, SearchService, TourDetailsLayout) {
	var ItineraryModalLayout = RenderedLayout.extend({
		el: '.itinerarymodal',

		initialize: function () {
			var outerscope = this;

			var tourIdsSet = $('.itinerarymodal').map(function() {
				return $(this).data('tourid');
			});
			var tourIds = _.map(tourIdsSet, function (tourid) {
				return tourid;
			});

			var parameters = { mainButtons: [{ Type: "itinerary" }], extraButtons: [], tourIds: tourIds };
			SearchService.requestTourDetailsResults(parameters);

			EventAggregator.on('requestTourDetailsResultsComplete', function () {
				$.each(tourIds, function(index, value) {
					var tourDetails = App.TourDetails.TourResults;
					//save tour details to object
					if (tourDetails && tourDetails.length > 0) {
						for (var i = 0; i < tourDetails.length; i++) {
							if (tourDetails[i].tourId == value || tourDetails[i].tourId.Guid == value) {
								outerscope.tourDetails = tourDetails[i];
								break;
							}
						}
					}

					var modal = $('[data-tourid="' + value + '"]');
					var regionSettings = {
											el: $('[data-tourid="' + value + '"] .modal-content'),
											viewType: "itinerary",
											tourUrl: $(modal).data("toururl"),
											isBookingAvailable: false,
											data: outerscope.tourDetails,
											isModal: true,
											packagedates: $(modal).data('packagedates'),
											showdateselector: $(modal).data('showdateselector'),
											showtourdetails: $(modal).data('showtourdetails')
					};

					this.regionSettings = regionSettings;
					new TourDetailsLayout(regionSettings);
				});
			});
		}
	});
	return ItineraryModalLayout;
});
