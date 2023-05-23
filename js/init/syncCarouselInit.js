define([
	"app",
	'jquery',
	'underscore',
	'marionette',
	'backbone',
	'domReady',
	'renderedLayouts/destinationPageComponents/syncCarousel'
],
    function (App, $, _, Marionette, Backbone, domReady, syncCarouselLayout) {
    	App.module("SyncCarousel", function () {
    		this.startWithParent = false;

    		this.addInitializer(function () {
    			domReady(function () {
    				var r = new syncCarouselLayout();
    			});
    		});
    	});
    });
