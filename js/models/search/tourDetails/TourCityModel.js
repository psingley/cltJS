// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
	var TourCityModel = Backbone.Model.extend({
		defaults: {
			title: '',			
			count: 0
		},
		initialize: function (value) {
			//this.set("title", value);
		}
	});
	// Return the model for the module
	return TourCityModel;
});