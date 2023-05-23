define([
    'domReady!',
    'jquery',
    'underscore',
    'backbone',
	'extensions/marionette/views/RenderedLayout',
	'util/seoTaggingUtil',
	'cookie'
], function (doc, $, _, Backbone, RenderedLayout, SeoTaggingUtil, cookie) {
	var regionPageIntroComponentLayout = RenderedLayout.extend({
		el: '#main',
		events: {
			'click .scroll-to': 'scrollFunction'
		},
		ui: {
			'$regionTours': '#region-tours',
			'$regionToursNav': '#region-tours-nav',
			'$regionDestinations': '#region-destinations',
			'$regionDestinationsNav': '#region-destinations-nav',
			'$regionBrochures':'#region-brochures',
			'$regionBrochuresNav':'#region-brochures-nav',
			'$regionVideosNav': '#region-videos-nav',
			'$regionVideos': '#video-playlist-section #regionPage',
			'$regionPhotos': '#region-photos',
			'$regionPhotosNav': '#region-photos-nav'
		},

		initialize: function () {
			var self = this;
			self.SetNavBarElements();
		},

		SetNavBarElements: function () {
			if (this.ui.$regionTours.length > 0) {
				this.ui.$regionToursNav.show();
			}
			if (this.ui.$regionDestinations.length > 0) {
				this.ui.$regionDestinationsNav.show();
			}
			if (this.ui.$regionBrochures.length > 0) {
				this.ui.$regionBrochuresNav.show();
			}
			if (this.ui.$regionVideos.length > 0) {
				this.ui.$regionVideosNav.show();
			}
			if (this.ui.$regionPhotos.length > 0) {
				this.ui.$regionPhotosNav.show();
			}

		},

		scrollFunction: function (e) {
			if (location.pathname.replace(/^\//, '') === window.location.pathname.replace(/^\//, '') && location.hostname === window.location.hostname) {
				var target = e.currentTarget.hash,
						offset;
				if ($(e.currentTarget).attr("data-offset")) {
					offset = $(e.currentTarget).attr("data-offset");
				} else {
					offset = 0;
				}
				target = target.length ? target : $('[name=' + target.slice(1) + ']');
				if (target.length) {
					$('html,body').animate({
						scrollTop: $(target).offset().top - offset
					}, 750);
					return false;
				}
			}
		}
	});

	return regionPageIntroComponentLayout;
});