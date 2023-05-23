define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/booking/travelerInformation/ContactInfoView',
    'text!templates/booking/travelerInformation/thomasCook/tcContactInfoTemplate.html',
], function ($, _, Backbone, Marionette, App, ContactInfoView, tcContactInfoTemplate) {
    var TCContactInfoView = ContactInfoView.extend({
        templateHelpers: function () {
            var templateHelpers = {
                optInText: App.dictionary.get('common.FormLabels.OptInTextForEmail'),
                mailOptInText: App.dictionary.get('common.FormLabels.OptInTextForMail'),
                copyInfoText: App.dictionary.get('common.FormLabels.CopyInfo')
            };

            return _.extend(templateHelpers, ContactInfoView.prototype.templateHelpers.apply(this));
        },
        setDefaultCountry: function () {
            var unitedKingdom = App.locations.getLocationItem('countries', App.siteSettings.defaultCountryName);
            this.$el.find('.countryId').val(unitedKingdom.id);
            this.updateFormLocations();
        },
        template: Backbone.Marionette.TemplateCache.get(tcContactInfoTemplate)
    });
    return TCContactInfoView;
});