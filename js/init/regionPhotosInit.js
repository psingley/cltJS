// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
    "app",
    "renderedLayouts/regions/regionPhotosLayout",
    'domReady'
],
    function (App, regionPhotosLayout, domReady) {
    	App.module("Region-Photos", function () {
            var outerScope = this;
            this.startWithParent = false;

            this.addInitializer(function () {
            	domReady(function () {
                	//instantiate regionPhotosLayout for server side rendered components
                	var r = new regionPhotosLayout();
                });
            });
        });
    });