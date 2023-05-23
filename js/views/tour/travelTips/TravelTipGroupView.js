define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'models/tour/travelTips/TravelTipGroupModel',
    'views/tour/travelTips/TravelTipView',
    'text!templates/tour/travelTips/travelTipGroupTemplate.html'

], function($, _, Backbone, Marionette, TravelTipGroupModel, TravelTipView, travelTipGroupTemplate){
    var TravelTipGroupView = Backbone.Marionette.CompositeView.extend({
        model: TravelTipGroupModel,
        template: Backbone.Marionette.TemplateCache.get(travelTipGroupTemplate),
        className: "travelTipGroup",
        itemView: TravelTipView,
        itemViewOptions: function(){
            return { parent: 'travelTipGroup' };
        },
        initialize: function () {
            // grab the child collection from the parent model
            // so that we can render the collection as children
            // of this parent node
            this.collection = this.model.travelTips;
        },
        appendHtml: function (collectionView, itemView) {
            // ensure we nest the child list inside of
            // the current list item
            collectionView.$("div:first").append(itemView.el);
        }
    });
// Our module now returns our view
    return TravelTipGroupView;
});