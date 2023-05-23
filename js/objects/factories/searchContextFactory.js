define([
'jquery',
'underscore',
'backbone',
'marionette',
'app',
'objects/search/context/defaultSearchContext',
'objects/search/context/aaa/aaaSearchContext',
'objects/search/context/blogSearchContext'
], function ($, _, Backbone, Marionette, App, searchContext, aaaSearchContext, blogSearchContext) {
	/**
	* Takes a set of options in the constructor
	* and instantiates the correct search context
	*
	* @class searchContextFactory
	* @param options
	*/
	var searchContextFactory = (function () {
		var constructor = function (options) {

			/**
			* gets the default search context
			*
			* @method getDefaultSearchContext
			* @return void
			*/
			var getDefaultSearchContext = function () {
				App.Search.context = new searchContext();
			};

			/**
			* gets the aaa search context
			*
			* @method getAAASearchContext
			* @return void
			*/
			var getAAASearchContext = function () {
				App.Search.context = new aaaSearchContext();
			};

			/**
			* gets the blog search context
			*
			* @method getBlogSearchContext
			* @return void
			*/
			var getBlogSearchContext = function () {
				App.Search.context = new blogSearchContext();
			};

			if (App.isBlogSearch) {
				getBlogSearchContext();
			} else if (options.siteId === App.siteIds.AAA) {
				getAAASearchContext();
			} else {
				getDefaultSearchContext();
			}
		};

		return constructor;
	})();
	return searchContextFactory;
});