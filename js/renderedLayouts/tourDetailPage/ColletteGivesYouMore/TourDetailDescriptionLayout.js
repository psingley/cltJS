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
		'views/tourDetailPage/ColletteGivesYouMore/TourDetailDescriptionView',
		'extensions/marionette/views/RenderedLayout',
		'event.aggregator'
],
	function (App, $, _, Backbone, Marionette, TourDetailActivityLevelView, RenderedLayout, EventAggregator) {
	    var TourDetailDescriptionLayout = RenderedLayout.extend({
	        el: '#descriptionSection',
	        regions: {
	            defaultView: "#descriptionRegion"
	        },
	        initialize: function () {
	            var viewContext = this;
	            /**
				 * @event tourDetailsRequestComplete
				 */
	            EventAggregator.on('tourDetailsRequestComplete',
					function (tourDetailsModel) {
					    viewContext.showActivityLevel(tourDetailsModel.tourDetailActivityLevel);
					});
	        },
	        showActivityLevel: function (TourDetailActivityLevelModel) {
	            this.defaultView.show(
					new TourDetailActivityLevelView(
					{
					    model: TourDetailActivityLevelModel
					})
				);
	        }
	    });
	    // Our module now returns our view
	    return TourDetailDescriptionLayout;
	});