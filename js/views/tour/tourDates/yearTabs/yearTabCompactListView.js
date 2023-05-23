define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/tourDates/yearTabs/YearTabView',
    'collections/tour/tourDates/TourDatesByYearCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, YearTabView, TourDatesByYearCollection) {
	var YearTabCompactListView = Backbone.Marionette.CollectionView.extend({
		collection: TourDatesByYearCollection,
		tagName: 'ul',
		attributes: function () {			
			return {
				role: "tablist",				
				class: "year-tabs nav nav-tabs"				
			}
		},
		events: {
			'click a': 'switchTabs'
		},
		switchTabs: function() {
			$("div[data-content] .tab-content div[role='tabpanel']").removeClass("active");
		},
		itemView: YearTabView,

        itemViewOptions : function (model, index) {
            if (index == 0) {
                return {active: true};
            } else {
                return {};
            }
        },
        onShow: function () {            
        }
    });
    // Our module now returns our view
	return YearTabCompactListView;
});
