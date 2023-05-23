define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/tour/itineraries/ItineraryItemModel',
    'text!templates/tour/newItineraryLayout.html'

], function ($, _, Backbone, Marionette, App, ItineraryItemModel, newItineraryLayout) {
    var NewItineraryView = Backbone.Marionette.ItemView.extend({
        model: ItineraryItemModel,
        template: Backbone.Marionette.TemplateCache.get(newItineraryLayout),
        onRender: function () {
        	
        }
    });
// Our module now returns our view
    return NewItineraryView;
});
