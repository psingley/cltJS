define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout'
], function ($, _, Backbone, Marionette, RenderedLayout) {

	var feefoTourHeroLayout = RenderedLayout.extend({
		el: '.tour-detail-hero',

		events: {
			'click #tour-hero-feefo': 'scrollToReviews'
		},

		scrollToReviews: function (e) {
			e.preventDefault();
			var target = $('#tourdetailsreviews');
			$('html,body').animate({
				scrollTop: $(target).offset().top - 170
			}, 1000);
		}
	});
	return feefoTourHeroLayout;
});