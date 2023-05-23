// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		"renderedLayouts/regions/regionPageIntroLayout",
		'domReady'
],
	function (App, regionPageIntroComponentLayout, domReady) {
		App.module("Region-PageIntro-Component", function () {
		
			this.addInitializer(function () {
				domReady(function () {
					//instantiate regionPageIntroComponentLayout for server side rendered components
					var r = new regionPageIntroComponentLayout();
				});
			});
		});
	});