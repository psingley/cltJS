// Filename: models/project
define([
    'jquery',
    'underscore',
    'backbone',
    'models/tourDetailPage/tourDates/TourDatesByYearModel'
], function($, _, Backbone, TourDatesByYearModel){
    var TourDatesByYearCollection = Backbone.Collection.extend({
        defaults: {
            model: TourDatesByYearModel
        },
        initFromArray: function (array) {
        	this.set(
				 _(array.map(function (year) {
				 	return new TourDatesByYearModel(year);
				 }))
			);
        }
    });
    // Return the model for the module
    return TourDatesByYearCollection;
});