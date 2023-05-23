// Filename: router.js
//The router will load the correct dependencies depending on the current URL.
define([
'jquery',
'underscore',
'backbone',
'marionette'
], function ($, _, Backbone, Marionette) {
	return Backbone.Marionette.AppRouter.extend({
		appRoutes: {
			// Define some URL routes
			"q/": 'showDefaultBlogResults',
			'q/*actions': 'performBlogSearch',
			'': 'showDefaultBlogResults'
		}
	});
});