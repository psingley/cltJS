// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
	var VanityCodeModel = Backbone.Model.extend({
        defaults: {
            vanityCode: "",
            startDate: new Date().minDate,
            endDate: new Date().minDate
        }
    });
    // Return the model for the module
	return VanityCodeModel;
});
