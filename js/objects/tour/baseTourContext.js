define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'event.aggregator',
		'domReady',
		'util/uriUtil',
		'util/tourDetailUtil',
		'util/seoTaggingUtil',
		'util/objectUtil',
		'services/tourService',
		'views/tour/PackageDescriptionView',
		'renderedLayouts/tour/itineraries/ItineraryItemLayout',
		'views/tour/PackageExperiencesView',
		'renderedLayouts/tour/accommodations/AccommodationLayout',
		'views/tour/travelTips/TravelTipGroupListView',
		'renderedLayouts/tour/optionalExcursions/OptionalExcursionsLayout',
		'renderedLayouts/tour/tourCruise/TourCruiseLayout',
		'views/tour/ActivityLevelView',
		'views/tour/guidedTravelPerks/GuidedTravelPerkListView',
		'views/tour/otherTours/OtherTourListView',
		'jquery.cycle',
	    'renderedLayouts/tourDetailPage/itineraries/ItineraryItemLayout',
		'renderedLayouts/tour/tourExtensions/TourExtensionLayout',
	    'renderedLayouts/tourDetailPage/travelTips/TravelTipLayout',
		'renderedLayouts/tour/tourDates/TourDatesLayout',
		'renderedLayouts/tourDetailPage/tourDates/TourDatesLayout',
		'renderedLayouts/tour/availableOffers/AvailableOffersLayout',
		'renderedLayouts/tour/availableOffers/TwoTypesAvailableOffersLayout',
		'renderedLayouts/tourDetailPage/enhanceYourTrip/enhanceYourTripLayout',
        'renderedLayouts/tourDetailPage/ColletteGivesYouMore/ColletteGivesYouMoreLayout',
        'renderedLayouts/tourDetailPage/ColletteGivesYouMore/TourDetailActivityLevelLayout',
		'renderedLayouts/tourDetailPage/ColletteGivesYouMore/TourDetailDescriptionLayout',
], 

	function($,
		_,
		Backbone,
		Marionette,
		App,
		EventAggregator,
		domReady,
		UriUtil,
		TourDetailUtil,
		SeoTaggingUtil,
		ObjectUtil,
		TourService,
		PackageDescriptionView,
		ItineraryItemLayout,
		PackageExperiencesView,
		AccommodationLayout,
		TravelTipGroupListView,
		OptionalExcursionsLayout,
		TourCruiseLayout,
		ActivityLevelView,
		GuidedTravelPerkListView,
		OtherTourListView,
		JqueryCycle,
		TourItineraryLayout,
		TourExtensionLayout,
		TourTravelTipLayout,
		TourDateLayout,
		TourDetailDateLayout,
		AvailableOffersLayout,
		TwoTypesAvailableOffersLayout,
		EnhanceYourTripLayout,
        ColletteGivesYouMoreLayout,
        TourDetailActivityLevelLayout,
		TourDetailDescriptionLayout
	) {

		/**
		* The tour context class sets up the server side renderedLayouts
		* and subscribes to multiple events that can be overridden
		*
		* It can be inherited by other tour context classes.
		*
		* @class baseTourContext
		* @constructor
		*/
		var baseTourContext = (function() {
			var constructor = function() {

			};

			/**
		  * Sets the Marionette Rendered Layout for the tour options section
		  *
		  * @method setTourOptionsLayout
		  */
			constructor.prototype.setTourOptionLayout = function() {
				return new OptionalExcursionsLayout();
			};


			/**
			* Sets the Marionette Rendered Layout for tour dates
			*
			* @method setTourDatesLayout
			*/
			constructor.prototype.setTourDatesLayout = function() {
				/**
				* Sets the Marionette Rendered Layout for tour dates
				*
				* @property tourDatesLayout
				*/
				constructor.prototype.tourDatesLayout = new TourDateLayout({ el: "#dates_section" });
			};

			constructor.prototype.setTourDetailDatesLayout = function() {
				/**
				* Sets the Marionette Rendered Layout for tour dates
				*
				* @property tourDatesLayout
				*/
				constructor.prototype.TourDetailDatesLayout = new TourDetailDateLayout();
			};

			/**
			* Sets the Marionette Rendered Layout for the tour extensions section
			*
			* @method setTourExtensionLayout
			*/
			constructor.prototype.setTourExtensionLayout = function() {
				return new TourExtensionLayout();
			};
			/**
		 * Sets the Marionette Rendered Layout for the tour options section
		 * NEW TOUR DETAIL PAGE CHANGE
		 * @method setTourOptionsLayout
		 */
			constructor.prototype.setEnhanceYourTripLayout = function () {
				return new EnhanceYourTripLayout();
			};

			/**
			* Sets the Marionette Rendered Layout for the tour cruise section
			*
			* @method setTourCruiseLayout
			*/
			constructor.prototype.setTourCruiseLayout = function() {
				return new TourCruiseLayout();
			};


			/**
			* Sets the Marionette Rendered Layout for the available offers section
			*
			* @method setTourOptionsLayout
			*/
			constructor.prototype.setAvailableOffersLayout = function() {
				return new AvailableOffersLayout();
			};

		/**
        * Sets the Marionette Rendered Layout for the ColletteGivesYouMore section
		* NEW TOUR PAGE 
		* @method setColletteGivesYouMoreLayout
		*/
		constructor.prototype.setColletteGivesYouMoreLayout = function () {
		    return new ColletteGivesYouMoreLayout();
		};

		constructor.prototype.setTourDetailActivityLevelLayout = function () {
		    return new TourDetailActivityLevelLayout();
		};

		constructor.prototype.setTourDetailDescriptionLayout = function () {
		    return new TourDetailDescriptionLayout();
		};

		    /** Sets the Marionette Rendered Layout for the Itineraries section
		*
		* @method setTourOptionsLayout
		*/
		constructor.prototype.setItineraryItemLayout = function () {
			return new TourItineraryLayout();
		};

		/**
		* Sets the Marionette Rendered Layout for the TravelTips section
		*
		* @method setTourOptionsLayout
		*/
		constructor.prototype.setTravelTipLayout = function () {
			return new TourTravelTipLayout();
		};

			constructor.prototype.currentSliderImageNames = [];

			/**
			* A private method that sets all of the renderedLayouts for server side rendered
			* components
			*
			* @method onPageLoad
			* @return void
			*/
			constructor.prototype.onPageLoad = function() {
				var outerScope = this;
				domReady(function() {
					if (App.isNewTourDetailPage) {
						outerScope.setTravelTipLayout();
						outerScope.setTourDetailDatesLayout();
						outerScope.setItineraryItemLayout();
						outerScope.setColletteGivesYouMoreLayout();
						outerScope.setTourDetailActivityLevelLayout();
						outerScope.setTourDetailDescriptionLayout();
					} else {
						outerScope.setTourDatesLayout();
						outerScope.setTourOptionLayout();
					}
					
					if (UriUtil.getParameterByName("p") != 1) {
						if (App.isNewTourDetailPage) {
							outerScope.setEnhanceYourTripLayout();
						} else {
							outerScope.setTourExtensionLayout();
							outerScope.setTourCruiseLayout();
							outerScope.setAvailableOffersLayout();
						}
					}

					//initialize default slider - this is rendered on server side on page load
					var defaultSlideShow = $('.cycle_slideshow');
					defaultSlideShow.cycle();
				});
			};

			/**
			* Subscribes to the get tour detail service call
			*
			* @method onTourDetailsRequestComplete
			*/
			constructor.prototype.onTourDetailsRequestComplete = function() {
				var outerScope = this;

				/**
				* @event tourDetailsRequestComplete
				*/
				EventAggregator.on('tourDetailsRequestComplete',
					function(tourDetailsModel) {
						
							$("a.ga-book-now, .button_col a")
								.each(function() {

									var bookingUrl = $(this).attr("href");
									var attr = bookingUrl == null ? "data-url" : "href";
									bookingUrl = $(this).attr(attr);

									if (
										bookingUrl.indexOf("thomascooktours") !== bookingUrl.lastIndexOf("thomascooktours") ||
											bookingUrl.indexOf("memberchoicevacations") !== bookingUrl.lastIndexOf("memberchoicevacations") ||
											bookingUrl.lastIndexOf("gocollette") !== bookingUrl.lastIndexOf("gocollette")
									) {
										bookingUrl = bookingUrl.replace("://thomascooktours.com", "");
										bookingUrl = bookingUrl.replace("://memberchoicevacations.com", "");
										bookingUrl = bookingUrl.replace("://gocollette.com", "");
										$(this).attr(attr, bookingUrl);
									}
								});

							var mediaData = tourDetailsModel.get('media');
							if (mediaData) {
								var sliderImages = mediaData.sliderImages;
								//get incoming slider images
								var incomingSliderImageNames = _.pluck(sliderImages, 'url');
								//let's not render section again if we have the same images
								var foundImages = _.difference(incomingSliderImageNames, outerScope.currentSliderImageNames);
								var packageDescription = tourDetailsModel.get("description");
								if (foundImages.length > 0 || ObjectUtil.isNullOrEmpty(packageDescription)) {
									//let populate for tracking
									outerScope.currentSliderImageNames = _.pluck(sliderImages, 'url');

									//lets destroy slider component if exits
									var slideShow = $('#slideshow-slider');
									slideShow.cycle('destroy');

									console.log("about to create new PackageDescriptionView");

									App.descriptionRegion.show(new PackageDescriptionView({ model: tourDetailsModel }));
								}
							}

							if (UriUtil.getParameterByName("p") == 1) {
								outerScope.loadSections(tourDetailsModel, true);

							} else {
								outerScope.loadSections(tourDetailsModel, false);
							}
						
					});
			};

			constructor.prototype.loadSections = function (tourDetailsModel, filtered) {
				if (!filtered) {
				    App.otherToursRegion.show(new OtherTourListView({ collection: tourDetailsModel.recommendedTours }));
					//accomodations have zero items in the collection
					var accommodationLayout = new AccommodationLayout({ collection: tourDetailsModel.suppliers });
					App.accommodationsRegion.show(accommodationLayout);
					
				}

				var itineraryItemLayout = new ItineraryItemLayout({ collection: tourDetailsModel.itinerary });
				App.itineraryRegion.show(itineraryItemLayout);

				App.activityLevelRegion.show(new ActivityLevelView({ model: tourDetailsModel.activityLevel }));

				App.travelTipGroupsRegion.show(new TravelTipGroupListView({ collection: tourDetailsModel.travelTipGroups }));

				App.routeRegion.show(new PackageExperiencesView({ model: tourDetailsModel.packageExperiences }));

				if ($('#two_available_offers_section_container').length > 0) {
					var twoTypesAvailableOffers = new TwoTypesAvailableOffersLayout({ collection: tourDetailsModel.availableOffers });
				} else {
					var availableOffersLayout = new AvailableOffersLayout({ collection: tourDetailsModel.availableOffers });
					App.availableOffersRegion.show(availableOffersLayout);
				}

				if (!filtered) {
					App.guidedTravelPerksRegion.show(new GuidedTravelPerkListView({ collection: tourDetailsModel.guidedTravelPerks }));
				}

				if (tourDetailsModel.mainTitle != undefined) {
					TourDetailUtil.updateTourInfo(tourDetailsModel.mainTitle, tourDetailsModel.subTitle, tourDetailsModel.bannerImage);
				} else {
					TourDetailUtil.updateTourInfo(tourDetailsModel.title, null, tourDetailsModel.bannerImage);
				}
				TourDetailUtil.OnLoad();

				//update other tours height
				setTimeout(function() {
						TourDetailUtil.updateOtherToursHeight();
						EventAggregator.trigger('tourPageLoadComplete');
					},
					500);
			};

			return constructor;
		})();

		return baseTourContext;
	});