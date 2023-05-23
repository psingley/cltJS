define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/tour/itineraries/ItineraryItemModel',
    'text!templates/tourDetailPage/itineraries/itineraryDayByDayItemTemplate.html',
    'util/objectUtil'
], function ($, _, Backbone, Marionette, App, ItineraryItemModel, itineraryDayByDayItemTemplate, ObjectUtil) {
	var ItineraryItemView = Backbone.Marionette.ItemView.extend({
		model: ItineraryItemModel,
		template: Backbone.Marionette.TemplateCache.get(itineraryDayByDayItemTemplate),
		onShow: function () {

			var dictionaryItemBreakfast = App.dictionary.get('tourRelated.FreeFormText.Breakfast');
			var dictionaryItemLunch = App.dictionary.get('tourRelated.FreeFormText.Lunch');
			var dictionaryItemDinner = App.dictionary.get('tourRelated.FreeFormText.Dinner');

			var rainPrecipitation = this.model.get("rainFall");
			var highTemp = this.model.get("highTemperature");
			var lowTemp = this.model.get("lowTemperature");
			var supplier = this.model.get("supplier");

			var mealsElement = this.$el.find('.itineraryFood');
			var tempElement = this.$el.find('.itineraryTemperature');
			var rainElement = this.$el.find('.itineraryUmbrella');
			var supplierElement = this.$el.find('.itinerarySupplier');

			var breakfast = this.model.get("breakfast");
			var lunch = this.model.get("lunch");
			var dinner = this.model.get("dinner");
			

			if (!ObjectUtil.isNullOrEmpty(supplier) && (supplier.isHotel == true || supplier.isCruise == true)) {
				$(supplierElement).show();
			}

			//show temperature info
			if (!ObjectUtil.isNullOrEmpty(highTemp) || !ObjectUtil.isNullOrEmpty(lowTemp)) {
				$(tempElement).show();
			}

			//show rain info
			if (!ObjectUtil.isNullOrEmpty(rainPrecipitation) && rainPrecipitation > 0) {
				$(rainElement).show();
			}

			if (breakfast && lunch && dinner) {
				$(mealsElement).find(".meal").html(dictionaryItemBreakfast + ", " + dictionaryItemLunch + " & " + dictionaryItemDinner);
				$(mealsElement).show();

			} else if (!breakfast && !lunch && !dinner) {
				$(mealsElement).hide();
			} else {
				var mealsArray = [];

				if (breakfast) {
					mealsArray.push(dictionaryItemBreakfast);
				}
				if (lunch) {
					mealsArray.push(dictionaryItemLunch);
				}
				if (dinner) {
					mealsArray.push(dictionaryItemDinner);
				}
				var resultLine = mealsArray.join(" & ");

				$(mealsElement).find(".meal").html(resultLine);
				$(mealsElement).show();
			}

		},
		templateHelpers: function () {
			var viewContext = this;

			var dayStart = this.model.get("dayStart"),
				 dayEnd = this.model.get("dayEnd");
			var serviceOrder = this.model.serviceOrder;
			var nightText = App.dictionary.get('tourRelated.FreeFormText.Night');
			var hotelName = this.model.get('hotelName');

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
				dayNumberData: function () {
					if (serviceOrder != null) {
						return serviceOrder.name + ' ' + nightText;
					}
					if (dayStart != dayEnd) {
						return dayStart + ' - ' + dayEnd;
					}
					return dayStart;
				},
				viewDetailsText: App.dictionary.get('common.Buttons.ViewDetails'),
				viewAccommodationText: App.dictionary.get('tourRelated.FreeFormText.ViewAccommodation'),
				lowText: App.dictionary.get('common.Misc.Low'),
				highText: App.dictionary.get('common.Misc.High'),
				foodText: App.dictionary.get('tourRelated.FreeFormText.Meals'),
				thermaText: App.dictionary.get('tourRelated.FreeFormText.Temperature'),
				supplierText: App.dictionary.get('tourRelated.FreeFormText.Hotel'),
				umbrellaText: App.dictionary.get('tourRelated.FreeFormText.Rain'),
				supplierHtml: function () {
					var supplier = viewContext.model.get("supplier");
					if (ObjectUtil.isNullOrEmpty(supplier) || ObjectUtil.isNullOrEmpty(supplier.title)) {
						return '';
					}
					return supplier.title;
				},
				title: function() {
					var title = viewContext.model.get("title");
					if (serviceOrder != null) {
						return hotelName;
					}
					return title;
				},
				description: function () {
					var description = viewContext.model.get("description");
					if (ObjectUtil.isNullOrEmpty(description)) {
						return '';
					}
					return description;
				}
			}
		}
	});
	// Our module now returns our view
	return ItineraryItemView;
});