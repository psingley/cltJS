// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'collections/tour/tourDates/TourDatesByMonthCollection'
], function ($, _, Backbone, TourDatesByMonthCollection) {
    var TourDatesByYearModel = Backbone.Model.extend({
        defaults: {
            year: 0,
            datesByMonth: TourDatesByMonthCollection
        },
        initialize: function () {
            this.dates = new TourDatesByMonthCollection();
        }
    });
    // Return the model for the module
    return TourDatesByYearModel;
});
