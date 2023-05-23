define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout'
], function ($, _, Backbone, Marionette, RenderedLayout) {

	var feefoTourDetailLayout = RenderedLayout.extend({
		el: '#tourdetailsreviews',

		events: {
			'click #back-to-tour-details': 'scrollToHero'
		},

		scrollToHero: function (e) {
			e.preventDefault();
			var target = $('#main');
			$('html,body').animate({
				scrollTop: $(target).offset().top - 80
			}, 1000);
		}
	});
	return feefoTourDetailLayout;
});