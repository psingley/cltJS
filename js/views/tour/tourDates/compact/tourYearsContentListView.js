define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/tourDates/compact/tourYearGroupListView',
    'collections/tour/tourDates/TourDatesByYearCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, TourYearGroupListView, TourDatesByYearCollection) {
	var TourYearsContentListView = Backbone.Marionette.CollectionView.extend({
		tagName: 'div',		
        collection: TourDatesByYearCollection,
        itemView: TourYearGroupListView,
        itemViewOptions : function (model, index) {
            if (index == 0) {
                return {active: true, tourId: this.options.tourId };
            } else {
            	return { active: false, tourId: this.options.tourId };
            }
        },
        onShow: function () {         
        }
    });
    // Our module now returns our view
	return TourYearsContentListView;
});
