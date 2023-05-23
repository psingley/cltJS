// Filename: models/facetItems
define([
'jquery',
'underscore',
'backbone',
'collections/general/MediaImageCollection',
'models/taxonomy/TaxonomyModel'
], function ($, _, Backbone, MediaImageCollection, TaxonomyModel) {
	var CruiseComponentModel = Backbone.Model.extend({
		defaults: {
			name: '',
			description: '',
			images: MediaImageCollection,
			type: ''
		},
		initialize: function () {
			this.type = new TaxonomyModel();
		}
	});
	// Return the model for the module
	return CruiseComponentModel;
});
