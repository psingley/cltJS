define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/Header/StickyHeaderLayout'
	],
	function (App, $, domReady, StickyHeaderLayout) {
		App.module("Sticky", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					//instantiate ComponentCarouselLayout for server side rendered components
					var r = new StickyHeaderLayout();
				});
			});
		});
	});