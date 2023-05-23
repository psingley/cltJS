// Filename: models/facetItems
define([
	'jquery',
	'underscore',
	'backbone',
	'util/DateUtil',
	'collections/tour/itineraries/TourDatesCollection',
	'models/tour/itineraries/TourDateItemModel'	
], function ($, _, Backbone, DateUtil, TourDatesCollection, TourDateItemModel) {
	var TourGroupByYearModel = Backbone.Model.extend({
		defaults: {
			year: '',
			tourDates: TourDatesCollection
		},
		initialize: function (item) {
			this.attributes.tourDates = new TourDatesCollection();
			this.attributes.tourDates.initFromArray(item.tourDates);
		}		
	});
	// Return the model for the module
	return TourGroupByYearModel;
});