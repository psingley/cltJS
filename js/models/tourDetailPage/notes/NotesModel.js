// Filename: models/facetItems
define([
		'jquery',
		'underscore',
		'backbone'
	],
	function($, _, Backbone) {
		var NotesModel = Backbone.Model.extend({
			defaults: {
				note: '',
				category: ''
			}
		});
		// Return the model for the module
		return NotesModel;
	});
