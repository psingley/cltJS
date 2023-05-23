// Filename: models/facetItems
define([
'underscore',
'backbone'
], function (_, Backbone) {
	var FacetItemModel = Backbone.Model.extend({
		defaults: {
			name: 'item name',
			alternativeTitle: '',
			count: 0
		}
	});
	// Return the model for the module
	return FacetItemModel;
});