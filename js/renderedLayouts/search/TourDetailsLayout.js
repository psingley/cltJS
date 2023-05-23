define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
	'services/searchService',
    'views/search/tourDetails/TourCitiesView',
	'models/search/tourDetails/TourFeaturesViewModel',
	'models/search/tourDetails/TourCitiesViewModel',
	'models/search/tourDetails/TourItineraryModel',
	'models/search/tourDetails/TourOptionalModel',
	'views/search/tourDetails/TourItineraryView',
	'views/search/tourDetails/TourOptionalView',
	'views/search/tourDetails/TourFeaturesView',
	'renderedLayouts/search/TourDeparturesLayout',
	'models/search/tourDetails/TourActivityLevelModel',
	'views/search/tourDetails/TourActivityLevelView'
], function ($, _, Backbone, Marionette, App, EventAggregator, SearchService,
	TourCitiesView, TourFeaturesViewModel, TourCitiesViewModel,
	TourItineraryModel, TourOptionalModel,
	TourItineraryView, TourOptionalView, TourFeaturesView, TourDeparturesLayout, TourActivityLevelModel, TourActivityLevelView) {
	var activeTourOffsetTop = 68;//help to work with new title
	var activeTourWithTagsOffsetTop = 85;//help to work with new title

	var TourDetailsLayout = Backbone.Marionette.Layout.extend({
		regions: {
			tourView: $(this.el).find(".active-tour-details-content")
		},

		initialize: function () {
			//todo make code better here
			var self = this;
			var view;
			var tourDetails = self.options.data;
			var tourId = self.options.data.tourId;
			var defPackageDate = self.options.data.defaultTourPackageDate;
			
			var defaultItineraryId;
			if (defPackageDate != null) {
				defaultItineraryId = defPackageDate.packageDateId;
			}
			var model;
			var sectionData = this.getSectionDate(tourDetails.properties, self.options.viewType.toLowerCase());
			switch (self.options.viewType.toLowerCase()) {
				case 'cities':
				{
						model = new TourCitiesViewModel();
						model.tourDatesByYear.initFromArray(tourDetails.tourDates);
						model.set("tourId", tourId);
						model.set("defaultItineraryId", defaultItineraryId);						
						view = new TourCitiesView({ model: model, cities: sectionData });
						break;
					}
				case 'departures':
					{
						view = new TourDeparturesLayout({ tourId: tourId, discountMessage: sectionData.discountMessage, mycoll: sectionData.packageGroupByYear });
						break;
					}
				case 'itinerary':
					{
						model = new TourItineraryModel();
						model.tourDatesByYear.initFromArray(tourDetails.tourDates);
						//defaultSearchParams
						model.itineraryList.initFromArray(sectionData);
						model.set("tourId", tourId);
						model.set("isBookingAvailable", self.options.isBookingAvailable);
						model.set("tourUrl", self.options.tourUrl);
						model.set("isModal", self.options.isModal);
						model.set("packageDates", self.options.packagedates);
						model.set("showDateSelector", self.options.showdateselector);
						model.set("showTourDetails", self.options.showtourdetails);
						if (self.options.itineraryId) {
							//means click from departures section
							defaultItineraryId = self.options.itineraryId;
							model.set("defaultNeoId", self.options.itineraryNeoId);
						}
						model.set("defaultItineraryId", defaultItineraryId);
						view = new TourItineraryView({ model: model });
						break;
					}
				case 'features':
				{
						model = new TourFeaturesViewModel();
						model.tourDatesByYear.initFromArray(tourDetails.tourDates);
						view = new TourFeaturesView({ model: model, features: sectionData });
						break;
					}
				case 'options':
					{
						model = new TourOptionalModel();
						view = new TourOptionalView({ model: model });
						break;
					}
				case 'activity-level':
					{
						model = new TourActivityLevelModel(sectionData);
						view = new TourActivityLevelView({ model: model });
						break;
					}
				default:
					console.log(self.options.viewType + " type of TDS not defined");
					break;
			};

			if (view) {
				self.tourView.show(view);
				self.locationMove();
			}
		},
		getSectionDate: function (properties, sectionName) {
			if (properties && properties.length >= 0) {
				var lng = properties.length;
				for (var i = 0; i < lng; i++) {
					if (properties[i].propertyName == sectionName)
						return properties[i].data;
				}
			}
			return null;
		},
		locationMove: function () {
			var self = this;
			self.tourSidebar = $(self.el).find(".active-tour-details"); //move to some renderlayout 			
			//logic about show section location
			var activeTour = $(".tour-active");
			var viewport = $(window), viewportHeight, viewportWidth;
			viewportHeight = viewport.height();
			viewportWidth = viewport.width();

			if ($(self.el).is(':visible') && $(self.tourSidebar).is(':visible')) {
				$(self.el).css({
					minHeight: activeTour.height()
				});
				self.positionActiveTour();
			} else {
				self.tourSidebar.modal('show');
			}
		},
		positionActiveTour: function () {
			var activeTour = $(".tour-active");
			if (activeTour.length) {
				var tourOffsetTop = activeTour.find("> .inner").offset().top;
				var offsetTop = activeTourOffsetTop;
				if (activeTour.find("> .tags").text().length) {
					offsetTop = activeTourWithTagsOffsetTop;
				}
				$('html,body').animate({
					scrollTop: tourOffsetTop - offsetTop
				}, 700);
			}
		}
	});
	// Our module now returns our view
	return TourDetailsLayout;
});
