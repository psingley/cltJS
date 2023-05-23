// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone, App) {
	var ColletteGivesYouMoreImageModel = Backbone.Model.extend({
		defaults: {
			imageUrl: '',
			description: '',
			altTag: '',
			placeholder: '',
			capsText: ''
		}
	});
	// Return the model for the module
	return ColletteGivesYouMoreImageModel;
});