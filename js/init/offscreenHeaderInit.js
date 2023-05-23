define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/Header/OffscreenHeaderLayout'
	],
	function (App, $, domReady, OffscreenHeaderLayout) {
		App.module("Mobile-Offscreen-Menu", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					//instantiate OffscreenHeaderLayout for server side rendered components
					var r = new OffscreenHeaderLayout();
				});
			});
		});
	});