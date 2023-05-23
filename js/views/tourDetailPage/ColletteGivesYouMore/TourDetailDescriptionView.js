define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/tourDetailPage/ColletteGivesYouMore/TourDetailActivityLevelModel',
    'text!templates/tourDetailPage/ColletteGivesYouMore/tourDetailDescriptionTemplate.html',
    'event.aggregator',
], function ($, _, Backbone, Marionette, App, TourDetailActivityLevelModel, tourDetailDescriptionTemplate, event) {
    var tourDetailDescriptionView = Backbone.Marionette.ItemView.extend({
        model: TourDetailActivityLevelModel,
        template: Backbone.Marionette.TemplateCache.get(tourDetailDescriptionTemplate),
        templateHelpers: function () {
            return {
                Description: this.model.get("description")
            }
        }
    });
    return tourDetailDescriptionView;
});
