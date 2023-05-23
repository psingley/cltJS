// Filename: models/project
define([
		'underscore',
		'backbone',
		'app'
	], function (_, Backbone, App) {
		var VideoParameterModel = Backbone.Model.extend({
			defaults: {
				countries: [],
				categories: [],
				continents: [],
				searchTerm: '',
				currentPage: 1,
				site: App.siteSettings.siteId
			},
			parse: function (response) {
				var data = JSON.parse(response.d);
				return data;
			}
		});
		// Return the model for the module
		return VideoParameterModel;
	});