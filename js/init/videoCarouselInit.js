// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		'chosen',
		"renderedLayouts/grid/VideoCarouselLayout",
		'domReady'
	],
	function (App, Chosen, VideoCarouselLayout, domReady) {
		App.module("Video-Carousel", function () {
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
					//instantiate views/renderedLayouts for server side rendered components
					var videoCarouselLayout = new VideoCarouselLayout();
				});
			});
		});
	});