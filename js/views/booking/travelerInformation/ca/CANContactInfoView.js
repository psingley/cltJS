define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/booking/travelerInformation/ContactInfoView',
    'text!templates/booking/travelerInformation/ca/canContactInfoTemplate.html'
], function ($, _, Backbone, Marionette, App, ContactInfoView, canContactInfoTemplate) {
    var CANContactInfoView = ContactInfoView.extend({
        templateHelpers: function () {
            var templateHelpers = {
                optInText: App.dictionary.get('common.FormLabels.OptInTextForEmail')
            };

            return _.extend(templateHelpers, ContactInfoView.prototype.templateHelpers.apply(this));
        },
        template: Backbone.Marionette.TemplateCache.get(canContactInfoTemplate)
    });
    return CANContactInfoView;
});