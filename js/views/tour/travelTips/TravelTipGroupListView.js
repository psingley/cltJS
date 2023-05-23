
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/travelTips/TravelTipGroupView',
    'collections/tour/travelTips/TravelTipGroupCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, TravelTipGroupView, TravelTipGroupCollection) {
    var TravelTipListView = Backbone.Marionette.CollectionView.extend({
        collection: TravelTipGroupCollection,
        itemView: TravelTipGroupView ,
        onShow: function()
        {
            //hides optional excursions section if empty
            if(this.collection == null || this.collection.length < 1 )
            {
                $('#travelTipsBottomSection').hide();
            }else{

                $('#travelTipsBottomSection').show();
            }

        }
    });
    // Our module now returns our view
    return TravelTipListView;
});
