// Filename: models/facetItems
define([
	'jquery',
	'underscore',
	'backbone',
	'models/general/MediaImageModel',
	'collections/tour/itineraries/ItineraryItemCollection',
	'collections/tour/optionalExcursions/OptionalExcursionsCollection',
	'collections/tourDetailPage/optionalExcursions/OptionalExcursionsCollection',
	'collections/tour/travelTips/TravelTipCollection',
	'collections/tour/accommodations/AccommodationCollection',
	'collections/tour/travelTips/TravelTipGroupCollection',
	'collections/tour/guidedTravelPerks/GuidedTravelPerkCollection',
	'collections/tour/otherTours/OtherTourCollection',
	'models/tour/PackageDescriptionModel',
	'models/tour/PackageExperiencesModel',
	'collections/tour/packageDateExtensions/PackageDateExtensionCollection',
	'models/tour/packageDateExtensions/PackageDateExtensionModel',
	'models/tour/itineraries/ItineraryItemModel',
	'models/tour/accommodations/AccommodationModel',
	'models/tour/travelTips/TravelTipModel',
	'models/tour/travelTips/TravelTipGroupModel',
	'models/tour/ActivityLevelModel',
	'models/tour/guidedTravelPerks/GuidedTravelPerkModel',
	'models/tour/otherTours/OtherTourModel',
	'models/tour/cruiseComponents/CruiseComponentModel',
	'collections/tour/tourExtensions/TourExtensionCollection',
	'util/objectUtil',
    'util/dateUtil',
    'util/dataLayerUtil',
	'models/tour/packageUpgrades/PackageUpgradeModel',
	'models/tour/availableOffers/AvailableOffersModel',
	'collections/tour/availableOffers/AvailableOffersCollection',
	'collections/tour/cruiseComponents/CruiseComponentCollection',
	'app',
	'collections/tourDetailPage/availableOffers/AvailableOfferCollection',
	'models/tourDetailPage/availableOffers/AvailableOffersModel',
	'collections/tourDetailPage/tourExtensions/TourExtensionCollection',
	'collections/tourDetailPage/prePost/PrePostCollection',
	'models/tourDetailPage/itineraries/ItineraryItemModel',
	'collections/tourDetailPage/itineraries/ItineraryItemCollection',
	'collections/tourDetailPage/travelTips/TravelTipCollection',
	'collections/tourDetailPage/travelTips/TravelTipGroupCollection',
	'models/tourDetailPage/travelTips/TravelTipModel',
	'models/tourDetailPage/travelTips/TravelTipGroupModel',
	'collections/tourDetailPage/notes/NotesCollection',
	'models/tourDetailPage/notes/NotesModel',
    'collections/tourDetailPage/ColletteGivesYouMore/ColletteGivesYouMoreImageCollection',
	'models/tourDetailPage/ColletteGivesYouMore/ColletteGivesYouMoreImageModel',
    'models/tourDetailPage/ColletteGivesYouMore/TourDetailActivityLevelModel',
	'models/tourDetailPage/packageUpgrades/PackageUpgradeModel'
], function ($, _, Backbone, MediaImageModel, ItineraryItemCollection, OptionalExcursionsCollection, TourOptionalExcursionsCollection, TravelTipCollection, AccommodationCollection, TravelTipGroupCollection, GuidedTravelPerkCollection, OtherTourCollection, PackageDescriptionModel, PackageExperiencesModel, PackageDateExtensionCollection, PackageDateExtensionModel, ItineraryItemModel, AccommodationModel, TravelTipModel, TravelTipGroupModel, ActivityLevelModel, GuidedTravelPerkModel, OtherTourModel, CruiseComponentModel, TourExtensionCollection, ObjectUtil, DateUtil, DataLayerUtil, PackageUpgradeModel, AvailableOffersModel, AvailableOffersCollection, CruiseComponentCollection, App, TourAvailableOfferCollection, TourAvailableOfferModel, TourDetailExtensionCollection, PrePostCollection, TourItineraryModel, TourItineraryCollection, TourTravelTipCollection, TourTravelTipGroupCollection, TourTravelTipModel, TourTravelTipGroupModel, NotesCollection, NotesModel, ColletteGivesYouMoreImageCollection, ColletteGivesYouMoreImageModel, TourDetailActivityLevelModel, TourPackageUpgradeModel) {
		var TourDetailsModel = Backbone.Model.extend({
			defaults: {
				itineraryItems: ItineraryItemCollection,
				accommodations: AccommodationCollection,
				optionalExcursions: OptionalExcursionsCollection,
				availableOffers: AvailableOffersCollection,
				travelTips: TravelTipCollection,
				packageDescription: PackageDescriptionModel,
				packageExperiences: PackageExperiencesModel,
				activityLevel: ActivityLevelModel,
				travelTipGroups: TravelTipGroupCollection,
				guidedTravelPerks: GuidedTravelPerkCollection,
				otherTours: OtherTourCollection,
				cruiseComponents: CruiseComponentCollection,
				title: '',
				bannerImage: MediaImageModel,
				tourAvailableOffers: TourAvailableOfferCollection,
				tourItineraryItems: TourItineraryCollection,
				tourTravelTips: TourTravelTipCollection,
				tourTravelTipGroups: TourTravelTipGroupCollection,
				tourNotes: NotesCollection,
				colletteGivesYouMoreImages: ColletteGivesYouMoreImageCollection,
				tourDetailActivityLevel: TourDetailActivityLevelModel,
				tourDetailOptions: ''
		},
		constructor: function () {
			Backbone.Model.apply(this, arguments);
		},
			url: function () {
			//making sure the tourDetailOptions contains packageDateId and currentItemId,  otherwise BAU
			if (this.get('tourDetailOptions') != null && this.get('tourDetailOptions').packageDateId != null && this.get('tourDetailOptions').packageDateId.length > 0 && this.get('tourDetailOptions').currentItemId != null && this.get('tourDetailOptions').currentItemId.length > 0) {
				var tourDetailOptionsJson = JSON.stringify(this.get('tourDetailOptions'));
				var tdo = JSON.stringify(tourDetailOptionsJson);
				return '/Services/Tours/TourService.asmx/GetTour?tourDetailOptionsJson=' + tdo;
			}
			else {
				return '/Services/Tours/TourService.asmx/GetTour';
            }
			
		},
		initialize: function() {
			this.itinerary = new ItineraryItemCollection();
			this.suppliers = new AccommodationCollection();
			this.optionalExcursions = new OptionalExcursionsCollection();
			this.tourOptionalExcursions = new TourOptionalExcursionsCollection();
			this.availableOffers = new AvailableOffersCollection();
			this.travelTips = new TravelTipCollection();
			this.packageDescription = new PackageDescriptionModel();
			this.packageExperiences = new PackageExperiencesModel();
			this.activityLevel = new ActivityLevelModel();
			this.travelTipGroups = new TravelTipGroupCollection();
			this.guidedTravelPerks = new GuidedTravelPerkCollection();
			this.recommendedTours = new OtherTourCollection();
			this.bannerImage = new MediaImageModel();
			this.tourExtensions = new TourExtensionCollection();
			this.tourDetailExtensions = new TourDetailExtensionCollection();
			this.cruiseComponents = new TourExtensionCollection();
			this.tourItinerary = new TourItineraryCollection();
			this.tourPrePost = new PrePostCollection();
			this.tourAvailableOffers = new TourAvailableOfferCollection();
			this.tourTravelTips = new TourTravelTipCollection();
			this.tourTravelTipGroups = new TourTravelTipGroupCollection();
			this.tourNotes = new NotesCollection();
			this.colletteGivesYouMoreImages = new ColletteGivesYouMoreImageCollection();
            this.tourDetailActivityLevel = new TourDetailActivityLevelModel();
			//fetch calls an on change event.
			this.on("change", this.fetchCollections);
			this.on("change", this.fillModels);
			
		},
		parse: function(response) {
            var data = JSON.parse(response.d);
			return data;
		},
		fetchCollections: function() {
			//while server returns us list of itinerary where each item is assigned to each day
			// we need to group any duplicates to show properly. Text may be the same for multiple days.
			this.fetchItineraries();
			//when we call fetch for the model we want to fill its collections

			var packageUpgradeSections = this.get('packageUpgradeSections');
			//when we call fetch for the model we want to fill its collections
			this.optionalExcursions.set(
				_(packageUpgradeSections.tourOptions)
				.map(function (optionalExcursion) {
					return new PackageUpgradeModel(optionalExcursion);
				})
			);

			//Required in New Tour Detail Design - EnhanceYourTrip
			var extensions = packageUpgradeSections.preExtensions;
			if (extensions != null) {
				extensions = extensions.concat(packageUpgradeSections.postExtensions);
			} else {
				extensions = packageUpgradeSections.postExtensions;
			}

			if (extensions != null) {
				extensions = extensions.concat(packageUpgradeSections.preUpgrades);
			} else {
				extensions = packageUpgradeSections.preUpgrades;
			}

			if (extensions != null) {
				extensions = extensions.concat(packageUpgradeSections.postUpgrades);
			} else {
				extensions = packageUpgradeSections.postUpgrades;
			}

			extensions =
				_.filter(extensions,
					function (extension) {
						return extension.serviceType.id !== App.taxonomy.getId('serviceTypes', 'Transfer');
					});

			//Condition to check if old design, if yes -> just load old collections
			if (!App.isNewTourDetailPage) {
				this.suppliers.set(
					_(this.get("suppliers"))
					.map(function(accommodation) {
						return new AccommodationModel(accommodation);
					})
				);

				this.cruiseComponents.set(
					_(this.get("cruiseComponents"))
					.map(function(cruiseComponent) {
						return new CruiseComponentModel(cruiseComponent);
					})
				);

				var travelTipItems = this.get('travelTips');

				//when we call fetch for the model we want to fill its collections
				this.travelTips.set(
					_(travelTipItems)
					.map(function(travelTip) {
						return new TravelTipModel(travelTip);
					})
				);

				//group the travel tips
				var groupedTravelTips = _.groupBy(travelTipItems,
					function(travelTip) {
						return travelTip.category;
					});

				this.travelTipGroups.set(
					_(groupedTravelTips)
					.map(function(travelTipGroup, category) {
						return new TravelTipGroupModel({ category: category, travelTips: travelTipGroup });
					})
				);

				//when we call fetch for the model we want to fill its collections
				this.guidedTravelPerks.set(
					_(this.get("guidedTravelPerks"))
					.map(function(guidedTravelPerk) {
						return new GuidedTravelPerkModel(guidedTravelPerk);
					})
				);

				//when we call fetch for the model we want to fill its collections
				this.recommendedTours.set(
					_(this.get("recommendedTours"))
					.map(function (otherTour) {
						return new OtherTourModel(otherTour);
					})
				);

				/*var offersList = this.get('tourOffers');
				var hideOffers = this.get("hideOffers");
				if (hideOffers != null) {
					if (DateUtil.validNow(hideOffers.startDateTime, hideOffers.endDateTime)) {
						offersList = offersList.filter(function(item) {
							!hideOffers.offerTypeIds.includes(item.offerWebsiteType.id);
						});
					}
				}

				//when we call fetch for the model we want to fill its collections
				this.availableOffers.set(
					_(offersList)
					.map(function(availableOffers) {
						return new AvailableOffersModel(availableOffers);
					})
				);*/

				this.tourExtensions.set(
					_(extensions)
					.map(function (extension) {
					    return new PackageUpgradeModel(extension);
					})
				);
			}
			else {

				this.tourTravelTips.set(
					_(this.get("travelTips"))
					.map(function (travelTip) {
						return new TourTravelTipModel(travelTip);
					})
				);

				//group the travel tips
				var tipGroups = this.tourTravelTips.groupBy(function (tip) {
					return tip.get('category');
				});

				this.tourTravelTipGroups.set(
					_(tipGroups)
					.map(function (tipGroups, category) {
						return new TourTravelTipGroupModel({ category: category, travelTips: tipGroups });
					})
				);

				this.tourNotes.set(
					_(this.get("documentNotes"))
					.map(function (note) {
						return new NotesModel(note);
					})
				);

				//New Tour Detail Page - we dont need Pre nights and Post nights so keeping only Extensions
				var tourDetailExtensions =
					_.filter(extensions, function (extension) {
						return extension.serviceType.id == App.taxonomy.getId('serviceTypes', 'Extension');
					});
				//New Tour Detail Page

				this.tourOptionalExcursions.set(
					_(packageUpgradeSections.tourOptions)
					.map(function (optionalExcursion) {
						return new PackageUpgradeModel(optionalExcursion);
					})
				);

				this.tourDetailExtensions.set(
				_(tourDetailExtensions).map(function (extension) {
					return new TourPackageUpgradeModel(extension);
				})
				);

				//New Tour Detail Page - Pre Post
				this.fetchPrePost(extensions);

				//New Tour Detail Page - add pre night and post night to itineraries array
				var prePostNightItinerary = new TourItineraryCollection();
				_.each(this.tourPrePost.models,
					function (prePost) {
						var prePostItin = new TourItineraryModel();
						prePostItin.attributes.description = prePost.attributes.description;
						prePostItin.attributes.itinImage = prePost.attributes.image;
						prePostItin.attributes.city = prePost.attributes.city.name;
						prePostItin.attributes.hotelName = prePost.attributes.title;
						prePostItin.serviceOrder = prePost.attributes.serviceOrder;

						prePostNightItinerary.push(prePostItin);
					});

				var outerscope = this;
				_.each(prePostNightItinerary.models, function (model) {
					if (model.serviceOrder.id == App.taxonomy.getId('serviceOrders', 'Pre')) {
						outerscope.tourItinerary.unshift(model);
					}
					if (model.serviceOrder.id == App.taxonomy.getId('serviceOrders', 'Post')) {
						outerscope.tourItinerary.push(model);
					}
				});
			}
		},
		fillModels: function () {
            var content = this.get("content");
		    var media = this.get("media");
			this.title = content.title;
            this.mainTitle = content.mainTitle;
            this.subTitle = content.subTitle;
			this.bannerImage = this.get("bannerImage");
			var links = this.get("links");
            var display = this.get("display");

		    this.packageDescription.set({
		        packageSubTitle: content.subTitle,
		        description: content.description,
		        sliderImages: media.sliderImages,
		        experienceUrl: links.experienceUrl,
		        experienceThisTourText: App.dictionary.get('tourRelated.Buttons.ExperienceThisTour'),
				showExperienceButton: display.showExperienceButton
			});

			var packageExperiences = this.get("yourRoute");
			this.packageExperiences.set({
				yourRouteTitle: packageExperiences.title,
				yourRouteSummary: packageExperiences.yourRouteSummary,
				yourRouteDescription: packageExperiences.yourRouteDescription,
				mapImage: packageExperiences.mapImage,
				extensionsHeaderTitle: packageExperiences.extensionsHeaderTitle,
				extensionsHeaderSubTitle: packageExperiences.extensionsHeaderSubTitle,
				choiceOnTour: packageExperiences.choiceOnTour,
				choiceOnTourTitle: packageExperiences.choiceOnTourTitle,
				culinary: packageExperiences.culinary,
				culinaryTitle: packageExperiences.culinaryTitle,
				mustSee: packageExperiences.mustSee,
				mustSeeTitle: packageExperiences.mustSeeTitle
            });
            //change subtitle in header
            var elem_subTitle = document.querySelector('#pkg_subtitle');
            if (elem_subTitle !== null) elem_subTitle.textContent = this.packageDescription.attributes.packageSubTitle;
            //update data layer
            var activityLevel = this.get("activityLevel");
            var al = !ObjectUtil.isNullOrEmpty(activityLevel) ? this.get("activityLevel").activityLevelTitle : "";
            var pst = !ObjectUtil.isNullOrEmpty(this.packageDescription.attributes.packageSubTitle) ? this.packageDescription.attributes.packageSubTitle : "";
            if (pst !== "") { document.getElementById("newTourDetails").setAttribute("data-tourSubTitle", pst);  }

            try {
                DataLayerUtil.TourDetailPageData(al, pst);
            } catch (error) {
                console.error(error);
            }
            //change subtitle in Feefo section
            var elem_FeefoTitle = document.querySelector('.product-title');
            if(elem_FeefoTitle)  elem_FeefoTitle.textContent = document.querySelector("#pkg_title").textContent + " " + this.packageDescription.attributes.packageSubTitle;

            //change title and subtitle in breadcrumb
            var elem_breadcrumb = document.querySelector("ol.breadcrumb2017 li:nth-child(5)");
            if (elem_breadcrumb !== null) elem_breadcrumb.textContent = document.querySelector("#pkg_title").textContent + " " + this.packageDescription.attributes.packageSubTitle;


			this.setColletteGivesYouMoreImages(media, packageExperiences);
            
			this.tourDetailActivityLevel.set({
			    activityLevelNumber: activityLevel.title,
			    summary: activityLevel.summary,
			    description: content.description
			});

			
		

			if (!ObjectUtil.isNullOrEmpty(activityLevel)) {
			    this.tourDetailActivityLevel.set({
			        activityLevelNumber: activityLevel.title,
			        summary: activityLevel.summary,
			        description: content.description
			    });
			}

			//var activityLevel = this.get("activityLevel");

			if (!ObjectUtil.isNullOrEmpty(activityLevel)) {
				//old model
				this.activityLevel.set({
					activityLevelNumber: activityLevel.title,
					description: activityLevel.description,
					travelTipsSummary: activityLevel.travelTipsSummary,
					summary: activityLevel.summary,
					onImageUrl: activityLevel.onImageUrl,
					offImageUrl: activityLevel.offImageUrl
				});
			}
		},
            


                
		setColletteGivesYouMoreImages: function (media, packageExperiences) {
		    //colletteGivesYouMoreImages
		    var yourChoiceImage = media.choiceImage;
		    var yourChoiceDescription = packageExperiences.choiceOnTour.length;
		    if (yourChoiceImage != null && yourChoiceDescription > 0) {
		        this.colletteGivesYouMoreImages.push(
                    new ColletteGivesYouMoreImageModel(yourChoiceImage).set(
                    {
                        imageUrl: yourChoiceImage.mediaImageUrl,
                        description: packageExperiences.choiceOnTour,
                        altTag: yourChoiceImage.altTag,
                        placeholder: 'https://i.gocollette.com/placeholders/collette-gives-you-more/symbol-choice.png',
                        capsText: packageExperiences.choiceOnTourTitle
                    }));
		    }
			var mustSeeImage = media.mustSeeImage;
			if (mustSeeImage != null && packageExperiences.mustSee.length > 0) {
		        this.colletteGivesYouMoreImages.push(
                    new ColletteGivesYouMoreImageModel(mustSeeImage).set(
                    {
                        imageUrl: mustSeeImage.mediaImageUrl,
                        description: packageExperiences.mustSee,
                        altTag: mustSeeImage.altTag,
                        placeholder: 'https://i.gocollette.com/placeholders/collette-gives-you-more/symbol-camera.png',
                        capsText: packageExperiences.mustSeeTitle
                    }));
		    }
			var culinaryImage = media.culinaryImage;
			if (culinaryImage != null && packageExperiences.culinary.length > 0) {
		        this.colletteGivesYouMoreImages.push(
                    new ColletteGivesYouMoreImageModel(culinaryImage).set(
                    {
                        imageUrl: culinaryImage.mediaImageUrl,
                        description: packageExperiences.culinary,
                        altTag: culinaryImage.altTag,
                        placeholder: 'https://i.gocollette.com/placeholders/collette-gives-you-more/symbol-culinary.png',
                        capsText: packageExperiences.culinaryTitle
                    }));
		    }
			var cultureImage = media.cultureImage;
			if (cultureImage != null && packageExperiences.yourRouteSummary.length > 0) {
		        this.colletteGivesYouMoreImages.push(
                    new ColletteGivesYouMoreImageModel(cultureImage).set(
                    { 
                        imageUrl: cultureImage.mediaImageUrl,
                        description: packageExperiences.yourRouteSummary,
                        altTag: cultureImage.altTag,
                        placeholder: 'https://i.gocollette.com/placeholders/collette-gives-you-more/symbol-culture.png',
                        capsText: packageExperiences.title
                    }));
		    }
		   
		},
		
		fetchItineraries: function() {
			var itinerariesArray = [];

			var incomeItinerary = this.get("itinerary").sort(function(a, b) {
				return a.dayNumber - b.dayNumber;
			});

			var itineraryItem = incomeItinerary[0],
				startDay = itineraryItem.dayNumber,
				endDay = startDay;

			for (var i = 1; i < incomeItinerary.length; i++) {
				if (incomeItinerary[i].id === itineraryItem.id) {
					endDay = incomeItinerary[i].dayNumber;
				} else {
					itinerariesArray.push(new ItineraryItemModel(itineraryItem).set({
						dayStart: startDay,
						dayEnd: endDay
					}));

					itineraryItem = incomeItinerary[i];
					startDay = itineraryItem.dayNumber;
					endDay = startDay;
				}
			}
			itinerariesArray.push(new ItineraryItemModel(itineraryItem).set({
				dayStart: startDay,
				dayEnd: endDay
			}));

			this.itinerary.set(itinerariesArray);
			//New Tour Detail Page Design - Itineraries
			this.tourItinerary.set(itinerariesArray);
		},
		fetchPrePost: function (extensions) {
			var prePostNights = extensions;

			prePostNights = _.filter(prePostNights,
					function (prePostNight) {
						return prePostNight.serviceType.id !== App.taxonomy.getId('serviceTypes', 'Extension');
					});

			if (prePostNights != null) {
				
				prePostNights = _(prePostNights).map(function(prePostNight) {
						return new TourPackageUpgradeModel(prePostNight);
				});

				var preNights = _.filter(prePostNights,
					function (prePostNight) {
						return prePostNight.attributes.serviceOrder.id == App.taxonomy.getId('serviceOrders', 'Pre');
					});

				var postNights = _.filter(prePostNights, function (prePostNight) {
					return prePostNight.attributes.serviceOrder.id == App.taxonomy.getId('serviceOrders', 'Post');
				});

                var ppText = App.dictionary.get('tourRelated.FreeFormText.PerNight');
                var fromText = App.dictionary.get('tourRelated.FreeFormText.From');
				var ppText = App.dictionary.get('tourRelated.FreeFormText.PerNight');

                var checkForPriceAvailablePreNight = true;
				if (preNights.length > 1) {

					_.each(preNights,
						function (preNight) {
							var lowestSinglePrice = preNight.getLowestSinglePrice();
							preNight.lowestSinglePrice = lowestSinglePrice;
						});

					preNights.sort(function (a, b) { return a.lowestSinglePrice - b.lowestSinglePrice });

					var serviceTypeNamePricePre = "";
					for (var i = 0; i < preNights.length; i++) {
						var pricePre = preNights[i].lowestSinglePrice;
						var serviceTypeNamePre = preNights[i].attributes.serviceTypeDetail.name;

						if (pricePre != 0) {
                            pricePre = pricePre.toString().formatPriceTourOptions() + " " + ppText;
                            serviceTypeNamePricePre += serviceTypeNamePre + " - " + fromText + " " + pricePre + " <br> ";
                        } else {
                            checkForPriceAvailablePreNight = false;
							serviceTypeNamePricePre += serviceTypeNamePre + " <br> ";
						}
					}
					preNights[0].serviceTypeNamePrice = serviceTypeNamePricePre;
					preNights = preNights[0];
				} else {
                    preNights = preNights[0];
                    if (!ObjectUtil.isNullOrEmpty(preNights) && preNights.getLowestDoublePrice() <= 0)
                        checkForPriceAvailablePreNight = false;
				}

                var checkForPriceAvailablePostNight = true;
				if (postNights.length > 1) {

					_.each(postNights,
						function (postNight) {
							var lowestSinglePrice = postNight.getLowestSinglePrice();
							postNight.lowestSinglePrice = lowestSinglePrice;
						});

					postNights.sort(function (a, b) { return a.lowestSinglePrice - b.lowestSinglePrice });

					var serviceTypeNamePricePost = "";
					for (var i = 0; i < postNights.length; i++) {

						var pricePost = postNights[i].lowestSinglePrice;
						var serviceTypeNamePost = postNights[i].attributes.serviceTypeDetail.name;

						if (pricePost != 0) {
                            pricePost = pricePost.toString().formatPriceTourOptions() +
								" " + ppText;
                            serviceTypeNamePricePost += serviceTypeNamePost + " - " + fromText + " " + pricePost + " <br> ";
                        } else {
                            checkForPriceAvailablePostNight = false;
							serviceTypeNamePricePost += serviceTypeNamePost + " <br> ";
						}
					}

					postNights[0].serviceTypeNamePrice = serviceTypeNamePricePost;
					postNights = postNights[0];
				} else {
                    postNights = postNights[0];
                    if (!ObjectUtil.isNullOrEmpty(postNights) && postNights.getLowestDoublePrice() <= 0)
                        checkForPriceAvailablePostNight = false;
				}

				var tourPrePostArr = [];
                if (preNights != null && checkForPriceAvailablePreNight) {
					tourPrePostArr.push(preNights);
				}
                if (postNights != null && checkForPriceAvailablePostNight) {
					tourPrePostArr.push(postNights);
				}
					
				this.tourPrePost.set(tourPrePostArr);
				
			}
		}
	});
	// Return the model for the module
	return TourDetailsModel;
});