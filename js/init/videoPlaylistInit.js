// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		'chosen',
		"renderedLayouts/grid/VideoPlaylistLayout",
		'domReady'
	],
	function (App, Chosen, VideoPlaylistLayout, domReady) {
		App.module("Video-Playlist", function () {
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
					//instantiate views/renderedLayouts for server side rendered components
					var videoPlaylistLayout = new VideoPlaylistLayout();
				});
			});
		});
	});