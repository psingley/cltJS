// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		'chosen',
		"renderedLayouts/regions/regionBrochuresComponentLayout",
		'domReady'
	],
	function (App, Chosen, regionBrochuresComponentLayout, domReady) {
		App.module("Region-Brochures-Component", function () {
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
					//instantiate regionDestinationsComponentLayout for server side rendered components
					var r = new regionBrochuresComponentLayout();
				});
			});
		});
	});