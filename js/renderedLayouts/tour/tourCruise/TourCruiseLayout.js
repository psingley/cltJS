/**
* @class TourCruiseLayout
* @extends RenderedLayout
*/
define([
'app',
'jquery',
'underscore',
'backbone',
'marionette',
'util/tourDetailUtil',
'views/tour/cruiseComponents/TourCruiseListView',
'views/tour/tourExtensions/TourExtensionView',
'collections/tour/tourExtensions/TourExtensionCollection',
'extensions/marionette/views/RenderedLayout',
'event.aggregator'
], function (App, $, _, Backbone, Marionette, TourDetailUtil, TourCruiseListView, TourExtensionView, TourExtensionCollection, RenderedLayout, EventAggregator) {
	var TourCruiseLayout = RenderedLayout.extend({
		el: '#cruise_section_container',
		regions: {
			defaultView: "#tourCruise"
		},
		ui: {
			'$expandedView': '.expanded',
			'$closeButton': '.close_button'
		},
		events: {
			'click .close_button': 'closeSection'
		},
		initialize: function () {
			var viewContext = this;

			/**
			* @event tourDetailsRequestComplete
			*/
			EventAggregator.on('tourDetailsRequestComplete', function (tourDetailsModel) {
				viewContext.showTourCruise(tourDetailsModel.cruiseComponents);
			});
		},
		showTourCruise: function (cruiseComponents) {
			this.defaultView.show(
			new TourCruiseListView(
			{
				collection: cruiseComponents,
				$expandedView: this.ui.$expandedView,
				$closeButton: this.ui.$closeButton
			})
			);
		},
		closeSection: function (e) {
			TourDetailUtil.closeExpandedSection(e, this.ui.$expandedView, this.ui.$closeButton);
		}
	});
	// Our module now returns our view
	return TourCruiseLayout;
});