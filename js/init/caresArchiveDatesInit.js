define([
	'app',
	'jquery',
	'domReady',
	'renderedLayouts/cares/ArchiveDatesLayout'
	],
	function (App, $, domReady, ArchiveDatesLayout) {
		App.module("Cares-Archive-Dates", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					var r = new ArchiveDatesLayout();
				});
			});
		});
	});