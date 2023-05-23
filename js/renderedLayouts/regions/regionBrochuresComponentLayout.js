define([
    'domReady!',
    'jquery',
    'underscore',
    'backbone',
		'extensions/marionette/views/RenderedLayout'
], function (doc, $, _, Backbone, RenderedLayout) {
	var regionBrochuresComponentLayout = RenderedLayout.extend({
		el: '#region-brochures',
		events: {
			'slide.bs.carousel .carousel': 'beforeSliding'
		},

		initialize: function() {
			var self = this;
			self.setViewportResizeSettingForCarousel();
		},

		setViewportResizeSettingForCarousel: function () {
			var viewport = $(window);
			viewport.resize(function () {
				$(".carousel-inner").height("auto");
			});
		},

		beforeSliding: function(e) {
			var self = this;
			self.animateHeightOfCarousel(e);
		},

		// Animate the height of carousel slides if they are different heights
		animateHeightOfCarousel: function (e) {
			var nextH = $(e.relatedTarget).outerHeight();
			$(this).find('.active.item').parent().animate({ height: nextH }, 500);
		}
	});

	return regionBrochuresComponentLayout;
});