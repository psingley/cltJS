// Filename: models/project
define([
    'jquery',
    'underscore',
    'backbone',
    'models/tour/tourDates/TourDateModel'
], function($, _, Backbone, TourDateModel){
    var TourDateCollection = Backbone.Collection.extend({
        defaults: {
            model: TourDateModel
        },
        setFromJson: function(json){
            var data = $.parseJSON(json);
            this.set(
                _(data.map(function (date) {
                    return new TourDateModel(date);
                }))._wrapped);
        }
    });
    // Return the model for the module
    return TourDateCollection;
});