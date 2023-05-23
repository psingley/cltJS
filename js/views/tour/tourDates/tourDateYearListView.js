define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/tourDates/TourDateMonthListView',
    'collections/tour/tourDates/TourDatesByYearCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, TourDateMonthListView, TourDatesByYearCollection) {
    var TourDateYearListView = Backbone.Marionette.CollectionView.extend({
        collection: TourDatesByYearCollection,
        itemView: TourDateMonthListView,
        itemViewOptions : function (model, index) {
            if (index == 0) {
                return {active: true};
            } else {
                return {};
            }
        },
        onShow: function () {
            //This is used to prevent the element from being wrapped in a <div> tag by default
            this.$el = this.$el.children();
            this.$el.unwrap();
        }
    });
    // Our module now returns our view
    return TourDateYearListView;
});
