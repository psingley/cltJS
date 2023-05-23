define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/tourDetailPage/tourDetail2017/PrePostSplitAccordianLayout'
],
	function (App, $, domReady, PrePostSplitAccordianLayout) {
		App.module("Pre-Post-Accordion", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					var s = new PrePostSplitAccordianLayout();
				});
			});
		});
	});