define([
		'jquery',
		'underscore',
		'backbone',
		'event.aggregator'
], function ($, _, Backbone, EventAggregator) {
	
	var videoPlaylistLayout = Backbone.Marionette.Layout.extend({
		el: '#showcase-items',
		events: {
			'click .showcase-item a': 'stageVideo'
		},
		
		initialize: function() {
			var showcaseItem = $('#video-playlist').find('.showcase-item');

			var video = showcaseItem.data('video');
			if (video != null) {
				this.initAddthisSharing(video);
			}
		},

		stageVideo: function(e) {
			e.preventDefault();

			var showcaseItem = $(e.target).closest('.showcase-item');
			var video = showcaseItem.data('video');

			this.setMainStage(video);
		},
		setMainStage: function (video) {
			if (!video.embedUrl.includes("wistia")) {
				window.player.cueVideoById(video.videoId);
			}

			var videoFrame = $('#video-frame');
			videoFrame.attr('data-itemId', video.itemId);
			videoFrame.attr('data-videoid', video.videoId);

			var videoTitle = $('.showcase-stage-details .padded h2');
			videoTitle.text(video.videoTitle);
			var videoDescription = $('.showcase-stage-details .padded span#description');
			videoDescription.html(video.videoDescription);

			this.initAddthisSharing(video);
		},
		initAddthisSharing: function (video) {
			var currentTemplateId = $('body').data('template');

			//only run on video pages
			if (currentTemplateId !== '{9F377693-D0C6-4D87-8081-DAE5951DEC7A}' && currentTemplateId !== '{A22099E5-CC8B-4BA0-B87C-A3ECAE3552C3}') {
				return;
			}

			$('meta[property="og:image"]').remove();
			$('head').append('<meta property="og:image" content="' + video.thumbnailImageUrl + '" />');

			$('meta[property="og:title"]').remove();
			$('head').append('<meta property="og:title" content="' + video.videoTitle + '" />');

			$('meta[name="description"]').remove();
			$('head').append('<meta name="description" content="' + video.videoTitle + '" />');


			var linkForTwitter = window.location.host + video.linkPath;
			$('.addthis_button_twitter').attr('addthis:url', linkForTwitter);
			$('.addthis_button_facebook').attr('addthis:url', video.embedUrl);
			$('.addthis_button_facebook').attr('addthis:screenshot', video.thumbnailImageUrl);

			addthis_share = {
				passthrough: {
					title: video.VideoTitle,
					twitter: {
						text: video.twitterText,
						url: linkForTwitter
					}
				}
			};

			addthis.toolbox('.addthis_toolbox');
		}
		});
		return videoPlaylistLayout;
	});