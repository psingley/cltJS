// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/itineraries/TourDateItemModel'
], function (_, Backbone, TourDateItemModel) {
	var TourDatesCollection = Backbone.Collection.extend({
        defaults: {
        	model: TourDateItemModel			
        },
        initFromArray: function (array) {
        	this.set(
			   _(array.map(function (date) {
			   	return new TourDateItemModel(date);
			   }))._wrapped);        	
        }
    });
    // Return the model for the module
	return TourDatesCollection;
});