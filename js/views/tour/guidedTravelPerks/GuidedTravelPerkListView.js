
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/guidedTravelPerks/GuidedTravelPerkView',
    'collections/tour/guidedTravelPerks/GuidedTravelPerkCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, GuidedTravelPerkView, GuidedTravelPerkCollection) {
    var GuidedTravelPerkListView = Backbone.Marionette.CollectionView.extend({
        collection: GuidedTravelPerkCollection,
        itemView: GuidedTravelPerkView,
        onShow: function()
        {
            //hides guided travel perks section if empty
            if (this.collection == null || this.collection.length < 1) {
                $('#travel_perks_section').parent().hide();
                $('#travel_perks_section').parent().attr('shownondesktop', 'false');
            } else
            {
                $('#travel_perks_section').parent().show();
                $('#travel_perks_section').parent().attr('shownondesktop', 'true');
            }
        }
    });
    // Our module now returns our view
    return GuidedTravelPerkListView;
});