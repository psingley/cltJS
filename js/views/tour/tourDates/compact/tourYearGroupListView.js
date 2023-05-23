define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/tourDates/compact/TourDateListView',
    'collections/tour/tourDates/TourDatesByMonthCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, TourDateListView, TourDatesByMonthCollection) {
	var TourYearGroupListView = Backbone.Marionette.CollectionView.extend({
        collection: TourDatesByMonthCollection,
        itemView: TourDateListView,
        tagName: 'div',
        initialize: function(input){
            this.model = input.model;
            this.collection = input.model.get("datesByMonth");
        },
        attributes: function(){
        	return {
        		class: "tab-content"                
            }
        },
        itemViewOptions: function (model, index) {
        	if (index == 0) {
        		return { active: true, tourId: this.options.tourId };
        	} else {
        		return { active: false, tourId: this.options.tourId };
        	}
        },
        onRender: function () {        
        }
    });
    // Our module now returns our view
	return TourYearGroupListView;
});
