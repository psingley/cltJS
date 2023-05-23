define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'util/objectUtil',
		'models/tourDetailPage/tourExtensions/TourExtensionModel',
		'text!templates/tourDetailPage/tourExtensions/tourExtensionTemplate.html'
],
	function ($,
		_,
		Backbone,
		Marionette,
		App,
		ObjectUtil,
		TourExtensionModel,
		tourExtensionTemplate) {
		var TourExtensionView = Backbone.Marionette.ItemView.extend({
			model: TourExtensionModel,
			template: Backbone.Marionette.TemplateCache.get(tourExtensionTemplate),
			ui: {
				'$button': '.btn'
			},
			initialize: function () {
				
			},
			templateHelpers: function () {
				var outerScope = this;

				var serviceOrder = this.model.get('serviceOrder'),
					title = this.model.get('title'),
					nightText = App.dictionary.get('tourRelated.FreeFormText.Night'),
					serviceType = this.model.get('serviceType'),
					formattedTitle = serviceOrder.name + ' Tour: ' + title + ' ' + serviceType.name,
					serviceTypeDetail = this.model.get('serviceTypeDetail'),
					price = this.model.getLowestDoublePrice(),
					StayIcon = $('#stayImgUrl').val(),
					StayText = $('#stayText').val(),
					MealsIcon = $('#mealsImgUrl').val(),
					MealsText = $('#mealText').val();

				var shouldShowPrice = true;
				if (price === 0) {
					shouldShowPrice = false;
				}

				if (typeof price !== 'string') {
					price = price.toString();
				}

                price = price.formatPriceTourOptions();

                var disclaimer;
                if (App.isUKSite) {
                    price = "From " + price;
                    disclaimer = "Flights may be required for this tour extension at additional cost"
				}

				var itinDayCount = 0;
				var itinDays = outerScope.model.get('itineraries');
				_.each(itinDays,
					function (day) {
						if (day.dayNumber > 0) {
							itinDayCount++;
						}
					});

				//check here to see if price is zero, if so set to N/A

				return {
					extensionDetailsText: App.dictionary.get('tourRelated.FreeFormText.ExtensionDetails'),
					ppText: function () {
						if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Hotel')) {
							return App.dictionary.get('tourRelated.FreeFormText.PerNight');
						}
                        return App.siteSettings.siteId == App.siteIds.Marriott ? App.dictionary.get('tourRelated.FreeFormText.PerPerson') : App.dictionary.get('tourRelated.FreeFormText.PP');
					},
					showPrice: function () {
						return shouldShowPrice;
					},
					formattedPrice: price,
                    formattedTitle: formattedTitle,
                    disclaimer: disclaimer,
					getImageUrl: function () {
						var image = outerScope.model.get("image");
						if (ObjectUtil.isNullOrEmpty(image) || ObjectUtil.isNullOrEmpty(image.url)) {
							return 'https://i.gocollette.com/placeholders/hotel-holder.jpg';
						}
						return image.url;
					},
					getAltTag: function () {
						var image = outerScope.model.get("image");
						if (ObjectUtil.isNullOrEmpty(image) || ObjectUtil.isNullOrEmpty(image.altTag)) {
							return '';
						}
						return image.altTag;
					},
					itineraries: outerScope.model.get('itineraries'),
					StayIcon: StayIcon,
					StayText: StayText,
					MealsIcon: MealsIcon,
					MealsText: MealsText,
					//SetUpMeals: outerScope.setMapMealsDays(outerScope.model.get('itineraries')),
					dayCount: function () {

						if (itinDayCount > 1)
							return itinDayCount + ' Days';
						else if (itinDayCount == 1)
							return '1 Day';
						else
							return '';

					},
					nightCount: function () {
						var nights = '';
						var nightCount = 0;

						if (itinDayCount > 1)
							nightCount = (itinDayCount - 1)

						if (nightCount > 1)
							nights = nightCount + ' Nights';
						else if (nightCount == 1)
							nights = nightCount + ' Night';

						return nights;
					}
				}
			},
			onShow: function () {
				var description = this.model.get('description');

				if (ObjectUtil.isNullOrEmpty(description)) {
					this.ui.$button.hide();
				}
			}
		});
		// Our module now returns our view
		return TourExtensionView;
	});