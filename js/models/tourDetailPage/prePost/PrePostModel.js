define([
	'jquery',
	'underscore',
	'backbone'
],
function($, _, Backbone) {
	var PrePostModel = Backbone.Model.extend({
		defaults: {
			title: '',
			description: '',
			summary: '',
			price: 0,
			city: ''
		}
	});
	//Return the model for the module
	return PrePostModel;
});