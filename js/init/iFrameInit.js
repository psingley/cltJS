// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		'chosen',
		"renderedLayouts/grid/IFrameLayout",
		'domReady'
	],
	function (App, Chosen, IFrameLayout, domReady) {
		App.module("IFrame-Component", function () {
			var outerScope = this;
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
					//instantiate views/renderedLayouts for server side rendered component
					var layout = new IFrameLayout();
				});
			});
		});
	});