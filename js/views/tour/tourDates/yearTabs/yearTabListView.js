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
    var YearTabListView = Backbone.Marionette.CollectionView.extend({
        collection: TourDatesByYearCollection,
        itemView: YearTabView,
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
    return YearTabListView;
});
