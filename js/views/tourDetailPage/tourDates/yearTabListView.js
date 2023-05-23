define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tourDetailPage/tourDates/YearTabView',
    'collections/tourDetailPage/tourDates/TourDatesByYearCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, YearTabView, TourDatesByYearCollection) {
	var YearTabListView = Backbone.Marionette.CollectionView.extend({
		collection: TourDatesByYearCollection,
		itemView: YearTabView,
		onShow: function () {

			//This is used to prevent the element from being wrapped in a <div> tag by default
			var divTags = $(".year");
			if (divTags.parent().is("div"))
				divTags.unwrap();
			
			this.$el = this.$el.children();
			this.$el.unwrap();

			$(".year-selector .tour-year-selector").first().addClass("is-selected");

		}
	});
	// Our module now returns our view
	return YearTabListView;
});
