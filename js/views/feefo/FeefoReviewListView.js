define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'event.aggregator',
	'util/objectUtil',
	'views/feefo/FeefoReviewView',
	'collections/feefo/FeefoCollection',
	'ekko.lightbox'
], function($, _, Backbone, Marionette, App, EventAggregator, ObjectUtil, FeefoReviewView, FeefoCollection) {
	var FeefoSummaryView = Backbone.Marionette.CollectionView.extend({
		collection: FeefoCollection,
		itemView: FeefoReviewView,

		onAfterItemAdded: function(){
			this.resetGalleryComponent();
		},

		onShow: function() {
			this.resetGalleryComponent();
		},

		resetGalleryComponent: function() {
			$('[data-toggle="lightbox"]').unbind('click');
			$('[data-toggle="lightbox"]').on('click', function(e) {
				e.preventDefault();
				$(this).ekkoLightbox({
					always_show_close: false
				});
			})
		}
	});
// Our module now returns our view
	return FeefoSummaryView;
});