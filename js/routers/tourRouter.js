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
			'': 'getTourDetails',
			'packageDate/:dateId/:hash':'getTourDetails',
			'packageDate/:dateId': 'getTourDetails',
			':hash': 'gotoHash'
		},

		// making the router case insensitive
		// to make sure "packageDate" or "packagedate" or "PackageDate"
		// work in the same way
		_routeToRegExp: function(route) {
			route = Backbone.Router.prototype._routeToRegExp.call(this, route);
			return new RegExp(route.source, 'i');
		}
	});
});