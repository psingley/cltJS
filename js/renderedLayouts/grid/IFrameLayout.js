define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'extensions/marionette/views/RenderedLayout'
], function($, _, Backbone, Marionette, App, RenderedLayout) {
	var iFrameLayout = RenderedLayout.extend({
		el: '.iframe-component',

		initialize: function() {
			var baseDomain = this.$el.data("basedomain");
			var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
			var eventer = window[eventMethod];
			var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

			// Listen to message from child window
			eventer(messageEvent, function(e) {
				var key = e.message ? "message" : "data";
				var data = e[key];

				if (e.origin !== baseDomain) //checking which domain sent message
				{
					return;
				} else {
					var msg = data.split(":")[0];
					var val = data.split(":")[1];

					switch (msg) {
					case "scrollPage":
						this.scrollPage(val);
						break;
					case "setIframeHeight":
						this.setIframeHeight(val);
						break;
					}
				}
			}, false);
		},

		scrollPerPage: function(h) {
			$('html, body').stop().animate({
				scrollTop: h
			}, 1000);
		},

		setIframeHeight: function(h) {
			$("#iframe-sweeps").css("height", h);
		}
	});
	return iFrameLayout;
});