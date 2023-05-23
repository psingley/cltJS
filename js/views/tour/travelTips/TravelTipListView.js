
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/travelTips/TravelTipView',
    'collections/tour/travelTips/TravelTipCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, TravelTipView, TravelTipCollection) {
    var TravelTipListView = Backbone.Marionette.CollectionView.extend({
        collection: TravelTipCollection,
        itemView: TravelTipView,
        tagName: "ul",
        itemViewOptions: function () {
            return { parent: 'travelTip' };
        }
    });
    // Our module now returns our view
    return TravelTipListView;
});

