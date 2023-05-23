define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout'
], function ($, _, Backbone, Marionette, RenderedLayout) {

	var offscreenHeaderLayout = RenderedLayout.extend({
		el: '#mobile-offscreen-menu',

		initialize: function() {
			var offscreenContainer = $(".offscreen-container"),
				offscreenToggles = $(".offscreen-toggle"),
				offscreensLeft = $(".offscreen-left"),
				offscreensRight = $(".offscreen-right"),
				showOffscreenLeftClass = "show-offscreen-left",
				showOffscreenRightClass = "show-offscreen-right",
				viewport = $(window),
				screenSm = 768;

			function toggleOffscreenState(offscreen) {
				offscreen.toggleClass("active");
				$('[data-target="#' + offscreen.attr("id") + '"]').toggleClass("target-onscreen");
			}

			offscreenToggles.each(function() {
				var toggle = $(this);
				toggle.click(function() {
					var target = $(toggle.attr("data-target"));
					if (target.hasClass("active")) {
						if (target.hasClass("offscreen-left")) {
							offscreenContainer.removeClass(showOffscreenLeftClass);
							offscreensLeft.removeClass("active");
						} else {
							offscreenContainer.removeClass(showOffscreenRightClass);
							offscreensRight.removeClass("active");
						}
					} else {
						if (target.hasClass("offscreen-left")) {
							if (!offscreenContainer.hasClass(showOffscreenLeftClass)) {
								offscreenContainer.toggleClass(showOffscreenLeftClass);
								if (offscreenContainer.hasClass(showOffscreenRightClass)) {
									offscreenContainer.toggleClass(showOffscreenRightClass);
								}
							}
							offscreensLeft.removeClass("active");
						} else {
							if (!offscreenContainer.hasClass(showOffscreenRightClass)) {
								offscreenContainer.toggleClass(showOffscreenRightClass);
								if (offscreenContainer.hasClass(showOffscreenLeftClass)) {
									offscreenContainer.toggleClass(showOffscreenLeftClass);
								}
							}
							offscreensRight.removeClass("active");
						}
						target.addClass("active");
					}
					toggle.toggleClass("target-onscreen");
				});
			});

			viewport.on("resize orientationchange", function() {
				$(".offscreen.active").each(function() {
					var offscreen = $(this);
					if (offscreen.hasClass("offscreen-mobile-only") && viewport.width() >= screenSm) {
						offscreenContainer.removeClass(showOffscreenLeftClass);
						offscreenContainer.removeClass(showOffscreenRightClass);
						toggleOffscreenState(offscreen);
					}
				});
			});
		}
	});
	return offscreenHeaderLayout;
});