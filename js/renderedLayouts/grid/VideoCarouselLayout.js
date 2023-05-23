define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'extensions/marionette/views/RenderedLayout'
	], function ($, _, Backbone, Marionette, App, RenderedLayout) {
		/**
		* @class videoCarouselLayout
		* @extends RenderedLayout
		*/
		var videoCarouselLayout = RenderedLayout.extend({
			el: '.video-carousel',
			initialize: function () {
				// Owl Carousel
				require(['owl.carousel'], function () {
					var fullWidthCarousel = $(".full-width-carousel");
					fullWidthCarousel.owlCarousel({
						loop: true,
						singleItem: true,
						nav: true,
						navText: ["<span class='fa fa-chevron-left'></span>", "<span class='fa fa-chevron-right'></span>"],
						theme: "collette-carousel"
					});
					fullWidthCarousel.show();
					var currentItemsPerPage = fullWidthCarousel.find('.owl-item').length;
					if (currentItemsPerPage <= 1) {
						var owlControls = fullWidthCarousel.find('.owl-controls');
						$(owlControls).hide();
					}

					var numberOfItemsPerPage = 3;
					var videoCarousel = $(".video-carousel");
					videoCarousel.owlCarousel({
						loop: true,
						items: numberOfItemsPerPage,
						nav: true,
						navText: ["<span class='fa fa-chevron-left'></span>", "<span class='fa fa-chevron-right'></span>"],
						theme: "collette-carousel"
					});
					videoCarousel.show();
					var currentItemsPerPage = videoCarousel.find('.owl-item').length;
					if (currentItemsPerPage <= numberOfItemsPerPage) {
						var owlControls = videoCarousel.find('.owl-controls');
						$(owlControls).hide();
					}
				});
			}
		});
		return videoCarouselLayout;
	});