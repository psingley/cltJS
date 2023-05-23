define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'text!templates/tour/tourDates/yearTabTemplate.html',
    'models/tour/tourDates/TourDatesByYearModel'
], function ($, _, Backbone, Marionette, App, YearTabTemplate, TourDatesByYearModel) {
    var YearTabView = Backbone.Marionette.ItemView.extend({
        model: TourDatesByYearModel,
        template: Backbone.Marionette.TemplateCache.get(YearTabTemplate),
        tagName: "li",
        attributes: function(){
            return {
                role: "presentation"
            }
        },
        onRender: function () {
            if (this.options.active) {
                this.$el.attr("class", "active");
            }
        },
        templateHelpers: function () {
            var outerScope = this;
            return {
                count: function() {
                    var result = 0;
                    outerScope.model.get("datesByMonth").forEach(function(item){
                        result += item.get("dates").length;
                    });
                    return result;
                },
                year : this.model.get("year")
            }
        }
    });
// Our module now returns our view
    return YearTabView;
});
