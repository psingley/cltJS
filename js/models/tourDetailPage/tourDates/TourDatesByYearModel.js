// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
	 'collections/tourDetailPage/tourDates/TourDatesByYearCollection'
], function ($, _, Backbone, TourDatesByYearCollection) {
    var TourDatesByYearModel = Backbone.Model.extend({
        defaults: {
        	year: 0,
        	dates: TourDatesByYearCollection
        },
        initialize: function () {
        	this.dates = new TourDatesByYearCollection();
        }
    });
    // Return the model for the module
    return TourDatesByYearModel;
});
