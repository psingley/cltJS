define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/tourDates/TourDateListView',
    'collections/tour/tourDates/TourDatesByMonthCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, TourDateListView, TourDatesByMonthCollection) {
    var TourDateMonthListView = Backbone.Marionette.CollectionView.extend({
        collection: TourDatesByMonthCollection,
        itemView: TourDateListView,
        tagName: 'div',
        initialize: function(input){
            this.model = input.model;
            this.collection = input.model.get("datesByMonth");
        },
        attributes: function(){
            return {
                role: "tabpanel"
            }
        },
        onRender: function () {
            if (this.options.active) {
                this.$el.attr("class", "dates-pane tab-pane active");
            }
            else {
                this.$el.attr("class", "dates-pane tab-pane");
            }
            this.$el.attr("id",this.model.get("year") + "-dates");
        }
    });
    // Our module now returns our view
    return TourDateMonthListView;
});
