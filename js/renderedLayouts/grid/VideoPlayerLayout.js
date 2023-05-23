define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'extensions/marionette/views/RenderedLayout',
		'goalsUtil',
		'event.aggregator'
], function ($, _, Backbone, Marionette, App, RenderedLayout, GoalsUtil, EventAggregator) {
	/**
	* @class videoCarouselLayout
	* @extends RenderedLayout
	*/
	var videoPlayerLayout = RenderedLayout.extend({
		el: '#video-frame',
		initialize: function () {
			var tag = document.createElement('script');
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}
	});

	window.onYouTubeIframeAPIReady = function () {
		window.player = new YT.Player('video-frame', {
			height: '100%',
			width: '100%',
			playerVars: {
				'autoplay': 1,
				controls: 0,
				'modestbranding': 1,
				'rel': 0,
				showinfo: 0
			},
			events: {
				'onStateChange': onPlayerStateChange
			}
		});
	};
	window.onPlayerStateChange = function (event) {
		var videoData = event.target["getVideoData"]();
		var videoItemId = $('#video-frame').attr('data-itemId');

		var videoProgress = player.getCurrentTime();
		var videoDuration = player.getDuration();
		var videoPercentViewed = Math.round((Math.round(videoProgress) / videoDuration) * 100);

		switch (event.data) {
			case YT.PlayerState.PLAYING:
				if (videoProgress < 1) {
					if (player.is70Percent) {
						player.is70Percent = false;
					}
					GoalsUtil.videoStarted(videoItemId);

					try {
						dataLayer.push({
							'event': 'ytEvent',
							'eventCategory': 'Video',
							'eventAction': 'Video Started',
							'eventLabel': videoData.video_id + ' - ' + videoData.title + ' - ' + videoItemId
						});
					} catch (ex) {
						console.log(ex);
					}
				}
				break;

			case YT.PlayerState.PAUSED:
				if (videoPercentViewed >= 70 && !player.is70Percent) {
					player.is70Percent = true;
					GoalsUtil.videoCompleted(videoItemId);

					try {
						dataLayer.push({
							'event': 'ytEvent',
							'eventCategory': 'Video',
							'eventAction': 'Video Completed',
							'eventLabel': videoData.video_id + ' - ' + videoData.title + ' - ' + videoItemId
						});
					} catch (ex) {
						console.log(ex);
					}
				}
				break;

			case YT.PlayerState.ENDED:
				if (!player.is70Percent) {
					player.is70Percent = true;
					GoalsUtil.videoCompleted(videoItemId);

					try {
						dataLayer.push({
							'event': 'ytEvent',
							'eventCategory': 'Video',
							'eventAction': 'Video Completed',
							'eventLabel': videoData.video_id + ' - ' + videoData.title + ' - ' + videoItemId
						});
					} catch (ex) {
						console.log(ex);
					}
				}
				break;

			case YT.PlayerState.CUED:
				window.player.playVideo();
				break;
		}
	};
	return videoPlayerLayout;
});