// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		'chosen',
		"renderedLayouts/grid/PageStickyNavLayout",
		'domReady'
	],
	function (App, Chosen, PageStickyNavLayout, domReady) {
		App.module("Page-Sticky-Nav", function () {
			var outerScope = this;
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
					//instantiate views/renderedLayouts for server side rendered components
					var pageStickyNavLayout = new PageStickyNavLayout();
				});
			});
		});
	});