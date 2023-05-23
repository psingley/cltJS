// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		'chosen',
		"renderedLayouts/grid/VideoFilterLayout",
		'domReady'
	],
	function (App, Chosen, VideoFilterLayout, domReady) {
		App.module("Video-Filter", function () {
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
					//instantiate views/renderedLayouts for server side rendered components
					var videoFilterLayout = new VideoFilterLayout();
				});
			});
		});
	});