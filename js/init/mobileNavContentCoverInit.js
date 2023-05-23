define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/Header/MobileNavContentCoverLayout'
	],
	function (App, $, domReady, MobileNavContentCoverLayout) {
		App.module("Mobile-Nav-Content-Cover", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					//instantiate MobileNavContentCoverLayout for server side rendered components
					var r = new MobileNavContentCoverLayout();
				});
			});
		});
	});