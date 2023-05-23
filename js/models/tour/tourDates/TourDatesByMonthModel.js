// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'collections/tour/tourDates/TourDateCollection'
], function ($, _, Backbone, TourDateCollection) {
    var TourDatesByMonthModel = Backbone.Model.extend({
        defaults: {
            year: 0,
            monthId: 0,
            monthName: '',
            dates: TourDateCollection
        },
        initialize: function () {
            this.dates = new TourDateCollection();
        }
    });
    // Return the model for the module
    return TourDatesByMonthModel;
});
