define([
	'domReady',
	'app',
	'jquery',
	'backbone',
	'marionette',
	'event.aggregator',
	'util/uriUtil',
	'util/tourDetailUtil',
	'util/objectUtil',
	'services/tourService',
	'objects/factories/tourContextFactory',
	'collections/tour/tourDates/TourDateCollection'
],
function (domReady, App, $, Backbone, Marionette, EventAggregator, UriUtil, TourDetailUtil, ObjectUtil, TourService, TourContextFactory, TourDateCollection) {
	return Backbone.Marionette.Controller.extend({
		initialize: function () {
			var outerScope = this;
			var tourContextFactory = new TourContextFactory();
			App.Tour.context = tourContextFactory.getTourContext();
			EventAggregator.on("tourPageLoadComplete", function () {
				var item = outerScope.hashToScroll;
				if (item != undefined && item.length == 1) {
					$(document).scrollTop(item.offset().top - 100);
				}
			});
		},
		gotoHash: function (hash) {
			this.getTourDetails(null, hash);
		},
		getTourDetails: function (packageDate, hash) {
			if (!ObjectUtil.isNullOrEmpty(hash)) {
				this.hashToScroll = $("#"+hash);
			}
			var tourDatesLayout = App.Tour.context.tourDatesLayout;
			var tourDetailDatesLayout = App.Tour.context.TourDetailDatesLayout;
			var currentItemId = App.siteSettings.currentItemId;

			if (($('#foundAvailableTourDates').val() || $('#foundAvailableTourDetailDates').val()) != "True" ) {

				//hide mobile title
				if (App.mobile) {
					$('#DateSelectorMobileTitle').show();
				}
				//hide slider section
				$('#slider_section').hide();

				//hide all hero buttons
				$('.text-description .btn_container').hide();

				//Set the pick from x dates text
				TourDetailUtil.generatePickFromText(0);

				console.log("Aborted!!! No Package dates available.");
				return;
			}

			if (!ObjectUtil.isNullOrEmpty(packageDate)) {
				var tourDetailOptions = {
					packageDateId: packageDate,
					currentItemId: App.siteSettings.currentItemId
				};

				TourService.getTourDetails(tourDetailOptions);
			}
			else {
				if (!App.isNewTourDetailPage) {
					TourService.getDefaultTourDetails();
				}
			}

			//Call to to web service to get the package date info.
			//Calling it here gives getTour web service priority
			TourService.getDatePackages(currentItemId);
			EventAggregator.on("tourDatesRequestComplete", function (tourDatesCollection) {
				var currentDatesLayout;
				if (App.isNewTourDetailPage) {
					currentDatesLayout = tourDetailDatesLayout;
					if (!ObjectUtil.isNullOrEmpty(packageDate)) {
						currentDatesLayout.setDateIdFromUrl(packageDate);
					}
				} else {
					currentDatesLayout = tourDatesLayout;
				}

				currentDatesLayout.buildTourDateSelectors(tourDatesCollection);
				if (ObjectUtil.isNullOrEmpty(packageDate)) {
					packageDate = TourDetailUtil.getPackageDate();
				}

				if (!ObjectUtil.isNullOrEmpty(packageDate)
					&& !App.isNewTourDetailPage) {
					currentDatesLayout.setSelectedDate(packageDate);
				}
			});
		}
	});
});