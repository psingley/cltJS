define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
	'util/tourDetailUtil',
    'views/tourDetailPage/travelTips/TravelTipGroupListView',
	'views/tourDetailPage/notes/NotesListView',
	'event.aggregator'
], function ($, _, Backbone, Marionette, App, TourDetailUtil, TravelTipGroupListView, NotesListView, EventAggregator) {
    var TravelTipLayout = Backbone.Marionette.Layout.extend({
    	el: '.notes-accordion',
		regions: {
			notesView: "#tourNotes",
			travelTipsView: "#tourTravelTips"
		},
		initialize: function () {
			var viewContext = this;

			/**
			* @event tourDetailsRequestComplete
			*/
			EventAggregator.on('tourDetailsRequestComplete',
				function (tourDetailsModel) {
					var notes = tourDetailsModel.tourNotes;
					var travelTips = tourDetailsModel.tourTravelTipGroups;

					if ((notes == null || notes.length <= 0) && (travelTips == null || travelTips.length <= 0)) {
						$('.before-you-go').hide();
					} else {
						$('.before-you-go').show();
						if (notes != null && notes.length > 0) {
							viewContext.showNotes(notes);
						} else {
							$('#tourNotes').hide();
							$('#notesTitle').hide();
						}

						if (travelTips != null && travelTips.length > 0) {
							viewContext.showTravelTips(travelTips);
						} else {
							$('#tourTravelTips').hide();
							$('#tipsTitle').hide();
						}
					}
				});
		},
		showTravelTips: function (tourTravelTipGroups) {
			this.travelTipsView.show(
				new TravelTipGroupListView(
				{
					collection: tourTravelTipGroups
				})
			);
		},
		showNotes: function(notes) {
			this.notesView.show(
				new NotesListView(
				{
					collection: notes
				})
			);
		}
	});
    // Our module now returns our view
    return TravelTipLayout;
});