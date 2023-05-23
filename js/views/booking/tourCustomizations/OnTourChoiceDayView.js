define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/tourCustomizations/PackageUpgradesGroupedByDayModel',
    'collections/booking/tourCustomizations/PackageUpgradesGroupedByDayCollection',
    'text!templates/booking/tourCustomizations/onTourChoiceDayTemplate.html',
    'views/booking/tourCustomizations/OnTourChoiceView',
    'app'
], function($, _, Backbone, PackageUpgradesModel, PackageUpgradesGroupedByDayCollection, onTourChoiceDayTemplate, OnTourChoiceView, App){
    var OnTourChoiceDayView = Backbone.Marionette.CompositeView.extend({
        collection: PackageUpgradesGroupedByDayCollection,
        itemView: OnTourChoiceView,
        template: Backbone.Marionette.TemplateCache.get(onTourChoiceDayTemplate),
        tagName:"div",
        className: 'booking customizations during_tour_options',
        initialize: function(input){
            this.model = input.model;
            this.collection = input.model.get("packageUpgrades");
        },
        templateHelpers: function() {
            return {
                dayText: App.dictionary.get('common.Calendar.Day')
            }
        }
    });

    return OnTourChoiceDayView;
});