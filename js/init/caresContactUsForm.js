// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		'chosen',
		"renderedLayouts/contactUs/CaresContactUsLayout",
		'domReady'
	],
	function (App, Chosen, Layout, domReady) {
		App.module("Cares-ContactUsForm", function () {
			var outerScope = this;
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
					//instantiate views/renderedLayouts for server side rendered components
					var layout = new Layout();
				});
			});
		});
	});