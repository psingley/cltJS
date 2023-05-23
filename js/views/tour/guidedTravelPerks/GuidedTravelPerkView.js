define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'util/objectUtil',
    'models/tour/guidedTravelPerks/GuidedTravelPerkModel',
    'text!templates/tour/guidedTravelPerks/guidedTravelPerkTemplate.html'

], function($, _, Backbone, Marionette, ObjectUtil ,GuidedTravelPerkModel, guidedTravelPerkTemplate){
    var GuidedTravelPerkView = Backbone.Marionette.ItemView.extend({
        model: GuidedTravelPerkModel,
        template: Backbone.Marionette.TemplateCache.get(guidedTravelPerkTemplate),
        className: "block",
        onShow: function () {
            var target = this.$el;
            var  url = this.model.get("url");
            //remove href if url is empty
            if (ObjectUtil.isNullOrEmpty(url)) {
               var arrowLink= $(target).find('.arrow_link');
                arrowLink.removeAttr('href');
                //remove arrow
                arrowLink.css('background','none') ;
            }
        }
    });
// Our module now returns our view
    return GuidedTravelPerkView;
});