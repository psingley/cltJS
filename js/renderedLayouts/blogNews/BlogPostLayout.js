define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout',
		'event.aggregator'
], function ($, _, Backbone, Marionette, RenderedLayout, EventAggregator) {

	var blogPostLayout = RenderedLayout.extend({
		el: '.post-single',

		initialize: function() {
			var outerscope = this;
			EventAggregator.on('requestPreviousNextComplete', function (prevNextUrl) {
				outerscope.setPrevNextButtons(prevNextUrl);
			});

		},
		setPrevNextButtons: function(prevNextUrl) {
			var prevUrl = prevNextUrl[0];
			var nextUrl = prevNextUrl[1];

			var prevNextNavBar = $('#prevNextPost');
			var prevButton = $(prevNextNavBar).find('.previous');
			var nextButton = $(prevNextNavBar).find('.next');

			if (prevUrl) {
				$(prevButton).show();
				$(prevButton).find('a').attr("href", prevUrl + window.location.hash);
			} else {
				$(prevButton).hide();
			}

			if (nextUrl) {
				$(nextButton).show();
				$(nextButton).find('a').attr("href", nextUrl + window.location.hash);
			} else {
				$(nextButton).hide();
			}

			if (!nextUrl && !prevUrl) {
				$(prevNextNavBar).hide();
			} else {
				$(prevNextNavBar).show();
			}
		}
	});
	return blogPostLayout;
});
