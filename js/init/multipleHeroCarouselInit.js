define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/hero/multipleHeroCarouselLayout'
	],
	function (App, $, domReady, MultipleHeroCarouselLayout) {
		App.module("Multiple-Hero-Carousel", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					var s = new MultipleHeroCarouselLayout();
				});
			});
		});
	});