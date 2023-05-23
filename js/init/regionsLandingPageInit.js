// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		"renderedLayouts/regionsLanding/regionsLandingLayout",
		'domReady'
	],
	function (App, regionsLandingLayout, domReady) {
	    App.module("RegionsLanding-Component", function () {
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
				    //instantiate regionsLandingLayout for server side rendered components
				    var r = new regionsLandingLayout();
				});
			});
		});
	});