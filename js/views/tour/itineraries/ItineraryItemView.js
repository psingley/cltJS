define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/tour/itineraries/ItineraryItemModel',
    'text!templates/tour/itineraries/itineraryItemTemplate.html'

], function ($, _, Backbone, Marionette, App, ItineraryItemModel, itineraryItemTemplate, itineraryItemBigTemplate) {
    var ItineraryItemView = Backbone.Marionette.ItemView.extend({
        model: ItineraryItemModel,
        template: Backbone.Marionette.TemplateCache.get(itineraryItemTemplate),
        tagName: "a",
        className:"itinerary_block",
        onRender: function () {
        	this.$el.attr("href", "#day" + this.model.get("dayNumber"));
        	this.$el.attr("id", "#day" + this.model.get("dayNumber"));
        },
        templateHelpers: function () {
            var dayStart = this.model.get("dayStart"),
                dayEnd = this.model.get("dayEnd");
			var isAir = this.model.get("isAir");
            return {
            	dayText: function(){
                    if (dayStart != dayEnd){
                        return App.dictionary.get('common.Calendar.Days');
                    }
                    return App.dictionary.get('common.Calendar.Day');
                },
                dayNumber: function(){
                    if (dayStart != dayEnd){
                        return dayStart + ' - ' + dayEnd;
                    }
                    return dayStart;
                },
				isAir : isAir,
            	lowText: App.dictionary.get('common.Misc.Low'),
            	highText: App.dictionary.get('common.Misc.High')
            }
        }
    });
// Our module now returns our view
    return ItineraryItemView;
});
