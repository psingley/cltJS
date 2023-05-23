define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'moment',
		'app',
		'event.aggregator',
		'extensions/marionette/views/RenderedLayout',
		'util/uriUtil',
		'util/tourDetailUtil',
		'util/seoTaggingUtil',
		'util/objectUtil',
		'util/dateUtil',
		'util/offersUtil',
		'services/tourService',
		'views/tourDetailPage/tourDates/TourDateYearListView',
		'views/tourDetailPage/tourDates/yearTabListView',
		'collections/tourDetailPage/tourDates/TourDateCollection',
		'collections/tourDetailPage/tourDates/TourDatesByYearCollection',
		'models/tourDetailPage/tourDates/TourDatesByYearModel'
	],
	function($, _, Backbone, Marionette, moment, App, EventAggregator, RenderedLayout, UriUtil, TourDetailUtil, SeoTaggingUtil, ObjectUtil, DateUtil, OffersUtil, TourService, TourDateYearListView, YearTabListView, TourDateCollection, TourDatesByYearCollection, TourDatesByYearModel) {
		var TourDateLayout = RenderedLayout.extend({
			el: '#tour-detail-dates-section',
			regions: {
				tabHeaders: ".year-selector",
				tabContent: ".tours-list"
			},
			
			setDateIdFromUrl: function (packageDateId) {
				//set it if only we have packagedateid in url
				if (!ObjectUtil.isNullOrEmpty(packageDateId)) {
					$("#tour-detail-dates-section").attr("data-packagedateid", packageDateId);
				}
			},
			buildTourDateSelectors: function(tourDatesCollection) {
				var datesByYears = this.getYearsCollection(tourDatesCollection);

				if (datesByYears.length >= 1) {
					this.tabHeaders.show(new YearTabListView({ collection: datesByYears }));
					this.tabContent.show(new TourDateYearListView({ collection: datesByYears }));
				} else {
					$("#tour-detail-dates-section").hide();
					$(".itinerary-map").hide();
					$("#pickDatesText").html("<b>Currently there are no dates available</b>");

					//get Default itinerary when no dates available
					TourService.getDefaultTourDetails();
				}

				$(this.$el).popover({
					selector: '.small-group-travel',
					trigger: 'hover',
					container: 'body'
				});
				$(this.getShowHideCallMessage(tourDatesCollection));
			},
			getYearsCollection: function(tourDatesCollection) {
				var result = new TourDatesByYearCollection();
				tourDatesCollection.models.forEach(function(item) {
					var date = moment(item.get("startDate")).toDate();
					var year = date.getFullYear();
					var yearModel = result.findWhere({ year: year });
					if (yearModel != undefined) {
						yearModel.set("dates", yearModel.get("dates").add(item));
					} else {
						result.add(new TourDatesByYearModel({
							year: year,
							dates: new TourDateCollection(item)
						}));
					}
				});
				return result;
			},
			getShowHideCallMessage: function (tourDatesCollection) {
				var last = tourDatesCollection.length - 1;
				var lasttourdate = tourDatesCollection.models[last].attributes.endDate;
				var element = document.getElementById('callForMoreDates');
				if (!ObjectUtil.isNullOrEmpty(element)){
					//if last tour date occurs before  May 1, 2023 - show the call message - else hide the call message
				moment(lasttourdate).isBefore(moment(showDisclaimerDateString)) ? element.style.display = "block" : element.style.display = "none";
				}

				var elementDepartureDAte = document.getElementById('departureDates');

				if (!ObjectUtil.isNullOrEmpty(elementDepartureDAte)) {
				moment(lasttourdate).isBefore(moment(showDisclaimerDateString)) ? elementDepartureDAte.style.display = "block" : elementDepartureDAte.style.display = "none";
				}
			},
			setSelectedDate: function (packageDateId) {

				var $tourDates = this.tabContent.find('.tour-banner');
				var currentDate = $tourDates.each($tourDates, function () {
					if ($(this).data("packagedateid") == packageDateId)
						return this;
				})
				console.log("implement this for new tour detail pages");
			}
		});
		return TourDateLayout;
	});