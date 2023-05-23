define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'event.aggregator',
	'util/objectUtil',		
	'goalsUtil',
	'extensions/marionette/views/RenderedLayout',
	'ekko.lightbox'
], function ($, _, Backbone, Marionette, App, EventAggregator, ObjectUtil, goalsUtil, RenderedLayout, Ecco) {
	var FeefoReviewsLayout = RenderedLayout.extend({
		el: '.reviews',
		regions: {
			feefoResultRegion: ".feefoResultView"
		},
		events: {
			'click #view-more-reviews': 'getMoreReviews'
		},

		initialize: function() {
			this.setGalleryComponent();
			this.processingBtnView();
		},
		
		setGalleryComponent: function () {			
			this.$el.find('[data-toggle="lightbox"]').on('click', function (e) {
				e.preventDefault();
				$(this).ekkoLightbox({
					always_show_close: false
				});
			})
		},
		getMoreReviews: function () {
			this.$el.find("li.review:hidden:lt(3)").show();			
			this.processingBtnView();
		},

		processingBtnView: function () {
			if (this.$el.find("li.review:hidden").length == 0)
			{
				$("#view-more-reviews").hide();
			}
		}
	});
	return FeefoReviewsLayout;
});