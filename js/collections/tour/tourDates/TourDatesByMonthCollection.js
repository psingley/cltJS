// Filename: models/project
define([
    'jquery',
    'underscore',
    'backbone',
    'models/tour/tourDates/TourDatesByMonthModel'
], function($, _, Backbone, TourDatesByMonthModel){
    var TourDatesByMonthCollection = Backbone.Collection.extend({
        defaults: {
            model: TourDatesByMonthModel
        }
    });
    // Return the model for the module
    return TourDatesByMonthCollection;
});