// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/itineraries/TourGroupByYearModel'
], function (_, Backbone, TourGroupByYearModel) {
	var TourDatesGroupByYearCollection = Backbone.Collection.extend({
        defaults: {
        	model: TourGroupByYearModel
        },
        initFromArray: function (array) {
        	this.set(
			   _(array.map(function (date) {
			   	var item = new TourGroupByYearModel(date);				
			   	return item;
			   }))._wrapped);        	
        }
    });
    // Return the model for the module
	return TourDatesGroupByYearCollection;
});