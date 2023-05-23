define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'models/tourDetailPage/itineraries/ItineraryItemModel',
	'text!templates/tourDetailPage/itineraries/itineraryDayItemTemplate.html',
	'util/objectUtil'
], function ($, _, Backbone, Marionette, App, ItineraryItemModel, ItineraryDayItemTemplate, ObjectUtil) {
	var ItineraryDayItemView = Backbone.Marionette.ItemView.extend({
		model: ItineraryItemModel,
		template: Backbone.Marionette.TemplateCache.get(ItineraryDayItemTemplate),
		onShow: function () {
			var serviceOrder = this.model.serviceOrder;
			var dayStart = this.model.get("dayStart"),
				dayEnd = this.model.get("dayEnd"),
				specialEvent = this.model.get("itinEvent");
			var dayNumberData = 0;
			if (serviceOrder != null) {
				dayNumberData = serviceOrder.name + ' ' + "night";
			}
			else if (dayStart != dayEnd) {
				dayNumberData = dayStart + ' - ' + dayEnd;
			} else {
				dayNumberData = dayStart;
			}
			if (dayNumberData == "1" || dayNumberData == "1 - 2") {
				this.$el.find('.day').addClass("day-selected");
			}
			if (!ObjectUtil.isNullOrEmpty(specialEvent)) {
				var eventsTitle = specialEvent.title;
				var eventsDescription = specialEvent.description;

				if (!ObjectUtil.isNullOrEmpty(eventsTitle) && !ObjectUtil.isNullOrEmpty(eventsDescription)) {
					$('.special-title').text(eventsTitle);
					$('.special-content').text(eventsDescription);
				} else {
					$('.day').hover(
						function() {
							$('.special-event-description').css('display', 'none');
						});
				}
			}
		},
		templateHelpers: function () {
			var dayStart = this.model.get("dayStart"),
				dayEnd = this.model.get("dayEnd"),
				supplier = this.model.get('supplier');
			var nightText = App.dictionary.get('tourRelated.FreeFormText.Night');
			var serviceOrder = this.model.serviceOrder;
			var city = this.model.get('city');
			var specialEvent = this.model.get('itinEvent');
			var itinImage = this.model.get('itinImage');
			var title = this.model.get('title');
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
						return '-'+ nightText.toLowerCase();
					}
					if (dayStart != dayEnd) {
						return dayStart + ' - ' + dayEnd;
					}
					return dayStart;
				},
				dayNumberData: function () {
					if (serviceOrder != null) {
						return serviceOrder.name + ' ' + nightText;
					}
					if (dayStart != dayEnd) {
						return dayStart + ' - ' + dayEnd;
					}
					return dayStart;
				},
				showPrePostLabel: function() {
					return serviceOrder != null;
				},
				prePostLabel: function() {
					return serviceOrder.name + '-' + nightText.toLowerCase();
				},
				showSpecialEvent: function() {
					return specialEvent != null && specialEvent != '';
				},
				specialEventText: App.dictionary.get('tourRelated.FreeFormText.SpecialEvent'),
				city: function() {
					if (serviceOrder != null) {
						if (city) {
							return city;
						}
					}
					if (supplier != null) {
						if (supplier != undefined && supplier.isCruise) {
							var cityname = title.split('-');
							if (cityname != null && !ObjectUtil.isNullOrEmpty(cityname[0])) {
								return cityname[0];
							}
							//default value for city name given by DM team
							return 'Cruising';
						}
						if (!ObjectUtil.isNullOrEmpty(supplier.city)) {
							return supplier.city;
						}
					}
					return '';
				},
				getItinImage: function () {
				    if (ObjectUtil.isNullOrEmpty(itinImage) || ObjectUtil.isNullOrEmpty(itinImage.url)) {
						if (serviceOrder != null) {
							return 'https://i.gocollette.com/tour-media-manager/default-images/pre-post-night-default.jpg';
						}
						return '';
				    }
					//return itinImage.url;
					var url = itinImage.url.replace("http://resources.gocollette.com", "https://resources.gocollette.com");//.replace("http://www.cfmedia.vfmleonardo.com", "https://deeljyev3ncap.cloudfront.net");
                    return url;
				},
				getItinImageAlt: function () {
					if (ObjectUtil.isNullOrEmpty(itinImage) || ObjectUtil.isNullOrEmpty(itinImage.altTag)) {
						return '';
					}
					return itinImage.altTag;
				}
			}
		}
	});
	// Our module now returns our view
	return ItineraryDayItemView;
});
