define([
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'models/tour/itineraries/ItineraryItemModel',
'text!templates/search/tourDetails/TourItineraryItemTemplate.html',
'util/objectUtil'
], function ($, _, Backbone, Marionette, EventAggregator, App, ItineraryItemModel, TourItineraryItemTemplate, ObjectUtil) {
	var ItineraryItemView = Backbone.Marionette.CompositeView.extend({
		model: ItineraryItemModel,
		template: Backbone.Marionette.TemplateCache.get(TourItineraryItemTemplate),
		tagName: "li",
		initialize: function () {

		},
		templateHelpers: function () {
			var outerScope = this;
			var dayStart = outerScope.model.get("dayStart"),
                dayEnd = outerScope.model.get("dayEnd");

			var dictionaryItemBreakfast = App.dictionary.get('tourRelated.FreeFormText.Breakfast');
			var dictionaryItemLunch = App.dictionary.get('tourRelated.FreeFormText.Lunch');
			var dictionaryItemDinner = App.dictionary.get('tourRelated.FreeFormText.Dinner');

			var rainPrecipitation = this.model.get("rainFall");
			var highTemp = this.model.get("highTemperature");
			var lowTemp = this.model.get("lowTemperature");
			var supplier = this.model.get("supplier");

		
			var breakfast = this.model.get("breakfast");
			var lunch = this.model.get("lunch");
			var dinner = this.model.get("dinner");

			var isSupplierExist = false;
			//show Hotel info
			if (supplier != null && (supplier.isHotel == true || supplier.isCruise == true)) {
				isSupplierExist = true;
			}

			var showFood = (breakfast || lunch || dinner);
			var foodText;
			if (breakfast && lunch && dinner) {
				foodText = dictionaryItemBreakfast + ", " + dictionaryItemLunch + " & " + dictionaryItemDinner;
			} else {
				var foodsArray = [];
				if (breakfast) {
					foodsArray.push(dictionaryItemBreakfast);
				}
				if (lunch) {
					foodsArray.push(dictionaryItemLunch);
				}
				if (dinner) {
					foodsArray.push(dictionaryItemDinner)
				}

				foodText = foodsArray.length > 0 ? foodsArray.join("&") : "";
			}
			var showTemperature = false;
			//show temperature info
			if (!ObjectUtil.isNullOrEmpty(highTemp) || !ObjectUtil.isNullOrEmpty(lowTemp)) {
				showTemperature = true;
			}

			return {
				showFood: showFood,
				foodText: foodText,
				heading: outerScope.model.get('heading'),
				description: outerScope.model.get('description'),
				dayStart: outerScope.model.get('dayStart'),
				dayEnd: outerScope.model.get('dayEnd'),
				rainPrecipitation: rainPrecipitation,
				accommodations: outerScope.model.get('accommodations'),
				highTemperature: highTemp,				
				lowTemperature: lowTemp,
				showTemperature: showTemperature,
				rainFall: outerScope.model.get('rainFall'),
				dayText: function () {
					if (dayStart != dayEnd) {
						return App.dictionary.get('common.Calendar.Days');
					}
					return App.dictionary.get('common.Calendar.Day');
				},
				dayNumber: function () {
					if (dayStart != dayEnd) {
						return dayStart + ' - ' + dayEnd;
					}
					return dayStart;
				},
				lowText: App.dictionary.get('common.Misc.Low'),
				highText: App.dictionary.get('common.Misc.High'),
				isSupplierExist: isSupplierExist,
				supplierHtml: function () {
					var supplier = outerScope.model.get("supplier");
					if (supplier == null) {
						return '';
					}
					if (ObjectUtil.isNullOrEmpty(supplier.url)) {
						return supplier.title;
					}
				    return supplier.title;
				}
			}
		}
	});

	return ItineraryItemView;
});