define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'models/tourDetailPage/itineraries/ItineraryItemModel',
	'text!templates/tourDetailPage/itineraries/itineraryDescriptionItemTemplate.html',
	'util/objectUtil'
], function ($, _, Backbone, Marionette, App, ItineraryItemModel, ItineraryDescriptionItemTemplate, ObjectUtil) {
	var ItineraryItemView = Backbone.Marionette.ItemView.extend({
		model: ItineraryItemModel,
		template: Backbone.Marionette.TemplateCache.get(ItineraryDescriptionItemTemplate),
		events: {
			'click .hotel-image-link': 'openHotelModal'
		},
		//leonardoImageUrl: "https://deeljyev3ncap.cloudfront.net",
		templateHelpers: function() {
			var dayStart = this.model.get("dayStart"),
				dayEnd = this.model.get("dayEnd"),
				supplier = this.model.get("supplier");

			var dictionaryItemBreakfast = App.dictionary.get('tourRelated.FreeFormText.Breakfast');
			var dictionaryItemLunch = App.dictionary.get('tourRelated.FreeFormText.Lunch');
			var dictionaryItemDinner = App.dictionary.get('tourRelated.FreeFormText.Dinner');
			var nightText = App.dictionary.get('tourRelated.FreeFormText.Night');
			
			var breakfast = this.model.get("breakfast");
			var lunch = this.model.get("lunch");
			var dinner = this.model.get("dinner");
			var rainPrecipitation = this.model.get("rainFall");
			var serviceOrder = this.model.serviceOrder;
			var hotelName = this.model.get('hotelName');
			var title = this.model.get('title');
			var itinImage = this.model.get('itinImage');
			var highTemp = this.model.get('highTemperature');
			var lowTemp = this.model.get('lowTemperature');
			var culinaryImg = $('#culinaryImgUrl').val();
			var hotelImg = $('#hotelImgUrl').val();
			var weatherImg = $('#weatherImgUrl').val();
			var specialEvent = this.model.get('itinEvent');
			return {
				dayText: function () {
					if (serviceOrder != null) {
						return serviceOrder.name;
					}
					if (dayStart != dayEnd) {
						return App.dictionary.get('common.Calendar.Days');
					}
					return App.dictionary.get('common.Calendar.Day');
				},
				dayNumber: function () {
					if (serviceOrder != null) {
						return nightText;
					}
					if (dayStart != dayEnd) {
						return dayStart + ' - ' + dayEnd;
					}
					return dayStart;
				},
				dayNumberData: function() {
					if (serviceOrder != null) {
						return serviceOrder.name + ' ' + nightText;
					}
					if (dayStart != dayEnd) {
						return dayStart + ' - ' + dayEnd;
					}
					return dayStart;
				},
				supplierPresent: function() {
					return supplier != null;
				},
				title: function(){ 
					if (serviceOrder != null) {
						return hotelName;
					}
					return title;
				},
				culinaryImg: function () {
				    return culinaryImg;
				},
				hotelImg: function () {
				    return hotelImg;
				},
				weatherImg: function () {
				    return weatherImg;
				},
				description:this.model.get('description'),
				lowText: App.dictionary.get('common.Misc.Low'),
				highText: App.dictionary.get('common.Misc.High'),
				city: function() {
                    if (supplier != null) {
                        //if supplier is cruise, change the city name accordingly
                        if (supplier.isCruise) {
                            var cityname = title.split('-');
                            if (cityname != null && !ObjectUtil.isNullOrEmpty(cityname[0])) {
                                return cityname[0];
                            }
                            //default value for city name given by DM team
                            return 'Cruising';
                        }
                        return supplier.city;
                    }
					return '';
				},
				hotelName: function() {
					if (supplier != null && supplier.isHotel) {
						return supplier.title;
					}
					
					return '';
				},
				hotelImage: function() {
                    if (!ObjectUtil.isNullOrEmpty(supplier) && supplier.isHotel && !ObjectUtil.isNullOrEmpty(supplier.image) && !ObjectUtil.isNullOrEmpty(supplier.image.mediaImageUrl)) {
						return supplier.image.mediaImageUrl;
					}
					return '';
					//return 'https://i.gocollette.com/tour-media-manager/default-images/hotel-default.jpg';
				},
				getItinImage: function () {
					if (ObjectUtil.isNullOrEmpty(itinImage) || ObjectUtil.isNullOrEmpty(itinImage.url)) {
						//if (serviceOrder != null) {
						//	return 'https://i.gocollette.com/tour-media-manager/default-images/pre-post-night-default.jpg';
						//}
						return '';
                    }
					var url = itinImage.url.replace("http://resources.gocollette.com", "https://resources.gocollette.com");//.replace("http://www.cfmedia.vfmleonardo.com", "https://deeljyev3ncap.cloudfront.net");
                    return url;

					//return itinImage.url;
				},
				getItinImageAlt: function () {
					if (ObjectUtil.isNullOrEmpty(itinImage) || ObjectUtil.isNullOrEmpty(itinImage.altTag)) {
						return '';
					}
					return itinImage.altTag;
				},
				mealsPresent: function() {
					return (breakfast || lunch || dinner);
				},
				mealsCopy: function () {
					var copy = '';
					if (breakfast) {
						copy = dictionaryItemBreakfast;
						if (lunch) {
							copy += " & " + dictionaryItemLunch;
						}
						if (dinner) {
							copy += " & " + dictionaryItemDinner;
						}
					}
					else if (lunch) {
						copy = dictionaryItemLunch;
						if (dinner) {
							copy += " & " + dictionaryItemDinner;
						}
					}
					else if (dinner) {
						copy = dictionaryItemDinner;
					}
					return copy;
				},
				rainFallPresent: function() {
					return (!ObjectUtil.isNullOrEmpty(rainPrecipitation) && rainPrecipitation > 0);
				},
				temperaturePresent: function() {
					return (!ObjectUtil.isNullOrEmpty(highTemp) || !ObjectUtil.isNullOrEmpty(lowTemp))
				},
				showWeather: function() {
					return this.rainFallPresent() || this.temperaturePresent();
				},
				showSpecialEvent: function() {
					return (!ObjectUtil.isNullOrEmpty(specialEvent));
				},
				hotelText: App.dictionary.get('tourRelated.FreeFormText.Hotel'),
				culinaryText: App.dictionary.get('tourRelated.FreeFormText.Culinary'),
				weatherText: App.dictionary.get('tourRelated.FreeFormText.Weather'),
				rainText: App.dictionary.get('tourRelated.FreeFormText.Rain')
			}
		},
		onShow: function () {
			var outerscope = this;
			var supplier = outerscope.model.get("supplier");
			var specialEvent = outerscope.model.get("itinEvent");
			var $hotelElement = outerscope.$el.find('.day-accordion[data-day=' + outerscope.model.attributes.dayNumber + ']');
			if ($hotelElement.length > 0) {
				var $child = $hotelElement.find('.hotel-image-link');
			}
			var isClientBase = $('#clientBase').val();
			if ((isClientBase.toLowerCase() == "false") && (!ObjectUtil.isNullOrEmpty(supplier)) && (!ObjectUtil.isNullOrEmpty(supplier.image)) && !ObjectUtil.isNullOrEmpty(supplier.image.url)) { //&& (supplier.image.url.indexOf(outerscope.leonardoImageUrl) >= 0)) {
				var vendorPropertyId = supplier.vendorPropertyId;
				if (vendorPropertyId != '') {
					$child.css('cursor', 'pointer');
				}
			}
			if (!ObjectUtil.isNullOrEmpty(specialEvent)) {
				var eventsTitle = specialEvent.title;
				var eventsDescription = specialEvent.description;

				if (!ObjectUtil.isNullOrEmpty(eventsTitle) && !ObjectUtil.isNullOrEmpty(eventsDescription)) {
					$('.special-title').text(eventsTitle);
					$('.special-content').text(eventsDescription);
				}
			}
			
		},
		openHotelModal: function () {
			var outerscope = this;
			var supplier = outerscope.model.get("supplier");
			var isClientBase = $('#clientBase').val();
			//if ((isClientBase.toLowerCase() == "true") || (ObjectUtil.isNullOrEmpty(supplier)) || (ObjectUtil.isNullOrEmpty(supplier.image) || ObjectUtil.isNullOrEmpty(supplier.image.url)) { //|| supplier.image.url.indexOf(this.leonardoImageUrl) < 0)) {
			//	return;
			//}
			var vendorPropertyId = supplier.vendorPropertyId;
			if (vendorPropertyId == '') {
				return;
			}
			var hotelImageViewer = $('#hotelmodal').find('#hotelTitle');
			$(hotelImageViewer).empty();
			$(hotelImageViewer).html(supplier.title);

			//if (!ObjectUtil.isNullOrEmpty(richMediaUrl) && !ObjectUtil.isNullOrEmpty(VFM)) {
			VFM.onReady(function () {
				VFM.load({ id: "vfmviewer", pid: vendorPropertyId});
				$('#hotelmodal').modal('show');
			});
		}
	});
	// Our module now returns our view
	return ItineraryItemView;
});
