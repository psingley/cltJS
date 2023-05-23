define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'models/tour/travelTips/TravelTipModel',
    'text!templates/tour/travelTips/travelTipFullTemplate.html'

], function ($, _, Backbone, Marionette, TravelTipModel, travelTipFullTemplate) {
    var TravelTipView = Backbone.Marionette.ItemView.extend({
        model: TravelTipModel,
        template: Backbone.Marionette.TemplateCache.get(travelTipFullTemplate),
        render:function () {
            //remove default div from review
            var html = this.template(this.model.toJSON());
            var newElement = $(html) ;
            this.$el.replaceWith(newElement);
            this.setElement(newElement);
            return this;
        }

    });
// Our module now returns our view
    return TravelTipView;
});
