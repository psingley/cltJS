// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
    "app",
    "renderedLayouts/regions/toursComponentLayout",
    'domReady'
],
    function (App, toursComponentLayout, domReady) {
    	App.module("Tours-Component", function () {
            this.startWithParent = false;

            this.addInitializer(function () {
            	domReady(function () {
            		//instantiate toursComponentLayout for server side rendered components
            		var r = new toursComponentLayout();
                });
            });
        });
    });