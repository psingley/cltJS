define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/header/SiteSelectorLayout'
	],
	function (App, $, domReady, siteSelectorLayout) {
		App.module("Site-Selector-Layout", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					var s = new siteSelectorLayout();
				});
			});
		});
	});