// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
	var StateModel = Backbone.Model.extend({
		defaults: {
			"id": '',
			"name": '',
			"code": '',
			"neoId": 0,
			"pivotalId": 0,
			"autocompleteSourceValue": ''
		}
	});
	// Return the model for the module
	return StateModel;
});