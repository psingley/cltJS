/**
 * @class ColletteGivesYouMoreLayout
 * @extends RenderedLayout
 */
define([
		'app',
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'views/tourDetailPage/ColletteGivesYouMore/ColletteGivesYouMoreImageListView',
		'extensions/marionette/views/RenderedLayout',
		'event.aggregator'
],
	function (App, $, _, Backbone, Marionette, ColletteGivesYouMoreImageListView, RenderedLayout, EventAggregator) {
		var ColletteGivesYouMoreLayout = RenderedLayout.extend({
		    el: '#collette-GivesYouMore-here',
			regions: {
				defaultView: "#colletteGivesYouMoreRegion"
			},
			initialize: function () {
				var viewContext = this;
				/**
				 * @event tourDetailsRequestComplete
				 */
				EventAggregator.on('tourDetailsRequestComplete',
					function (tourDetailsModel) {
						viewContext.showColletteGivesYouMore(tourDetailsModel.colletteGivesYouMoreImages);
					});
			},
			showColletteGivesYouMore: function (colletteGivesYouMoreImageCollection) {
				this.defaultView.show(
					new ColletteGivesYouMoreImageListView(
					{
						collection: colletteGivesYouMoreImageCollection
					})
				);

			}
		});
		// Our module now returns our view
		return ColletteGivesYouMoreLayout;
	});