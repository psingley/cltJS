// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
    "app",
    "renderedLayouts/regions/mapComponentLayout",
    'domReady'
],
    function (App, mapComponentLayout, domReady) {
    	App.module("Map-Component", function () {
            this.startWithParent = false;

            this.addInitializer(function () {
            	domReady(function () {
            		//instantiate mapComponentLayout for server side rendered components
            		var r = new mapComponentLayout();
                });
            });
        });
    });