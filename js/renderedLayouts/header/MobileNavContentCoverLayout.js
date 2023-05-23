define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'mobileEvents',
	'extensions/marionette/views/RenderedLayout'
], function($, _, Backbone, Marionette, MobileEvents, RenderedLayout) {

	var mobileNavContentCoverLayout = RenderedLayout.extend({
		el: '#mobile-nav-content-cover',

		initialize: function() {
			var outerScope = this;

			$(".navigation-sublink").click(function() {
				outerScope.closePanel();
			});
			$(".offscreen-toggle.target-onscreen").on("tap", function() {
				outerScope.closePanel();
			});
			$(this.el).on("swipeleft", function() {
				outerScope.closePanel();
			});
			$("#mobile-offscreen-menu").on("click", "[data-toggle=\"modal\"]",function () {
				outerScope.closePanel();
			});
			$(this.el).on("tap", function() {
				if (!Sitecore.PageModes.PageEditor) {
					outerScope.closePanel();
				}
			});
		},

		closePanel: function() {
			var bodyElement = $(this.el).closest('.offscreen-container');
			var mobileSidebar = bodyElement.find('#mobile-offscreen-menu');
			var sidebarButton = bodyElement.find('.offscreen-toggle');

			bodyElement.removeClass("show-offscreen-left");
			mobileSidebar.removeClass("active");
			sidebarButton.removeClass("target-onscreen");
		},

		openPanel: function() {
			var bodyElement = $(this.el).closest('.offscreen-container');
			var mobileSidebar = bodyElement.find('#mobile-offscreen-menu');
			var sidebarButton = bodyElement.find('.offscreen-toggle');

			bodyElement.addClass("show-offscreen-left");
			mobileSidebar.addClass("active");
			sidebarButton.addClass("target-onscreen");
		}
	});
	return mobileNavContentCoverLayout;
});