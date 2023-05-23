define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
	var LocationsOnAddressesModel = Backbone.Model.extend({
		version: "",
		url: function () {
			var siteName = $('body').data('site');
			this.version = $('body').data('dicversion');
			return '/json/' + siteName + '.locationsOnAddresses.json?v=' + this.version;
		},
		parse: function (response) {
			return response;
		}
	});

	return LocationsOnAddressesModel;
});