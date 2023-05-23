// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		"renderedLayouts/grid/VideoPlayerLayout",
		'domReady'
],
	function (App, VideoPlayerLayout, domReady) {
		App.module("Video-Player", function () {
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
					//instantiate views/renderedLayouts for server side rendered components
					var videoPlayerLayout = new VideoPlayerLayout();
				});
			});
		});
	});