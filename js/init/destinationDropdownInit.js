define([
	'app',
	'jquery',
	'domReady',
	'renderedLayouts/destinationPageComponents/destinationDropdownLayout'
	],
	function (App, $, domReady, DestinationDropdownLayout) {
		App.module("DestinationDropdown", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					var r = new DestinationDropdownLayout();
				});
			});
		});
	});