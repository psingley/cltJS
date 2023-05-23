define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/pageComponent/ComponentCarouselLayout'
	],
	function (App, $, domReady, ComponentCarouselLayout) {
		App.module("Carousel-Generic", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					//instantiate ComponentCarouselLayout for server side rendered components
					var r = new ComponentCarouselLayout();
					var carousel = $('#carousel-tour');
					carousel.bind('slide.bs.carousel', function () {
						r.slideLabels(carousel);
					});
				});
				});
			});
		});