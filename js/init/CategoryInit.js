define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/blogNews/CategoryNavLayout'
],
	function (App, $, domReady, CategoryNavLayout) {
	    App.module("CategoryNav", function () {
	        this.startWithParent = false;
	        this.addInitializer(function () {
	            domReady(function () {
	                //instantiate CategoryNavLayout for server side rendered components
	                var r = new CategoryNavLayout();
	            });
	        });
	    });
	});
