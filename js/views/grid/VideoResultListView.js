define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'event.aggregator',
		'views/grid/VideoResultView',
		'collections/grid/VideoResultCollection'
	], function ($, _, Backbone, Marionette, App, EventAggregator, VideoResultView, VideoResultCollection) {
		var VideoResultListView = Backbone.Marionette.CollectionView.extend({
			collection: VideoResultCollection,
			itemView: VideoResultView,

			initialize: function () {
			}
		});
		return VideoResultListView;
	});