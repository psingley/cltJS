define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'renderedLayouts/brochures/BrochureOrderFormLayout',
    'views/validation/ErrorView',
    'util/objectUtil'
], function ($, _, Backbone, Marionette, App, BrochureOrderFormLayout, ErrorView, ObjectUtil) {
    var UKBrochureOrderFormLayout = BrochureOrderFormLayout.extend({
        finalizeSubmission: function () {
            var viewContext = this,
                optInEmail = this.ui.$optInEmail.is(':checked'),
                email = this.ui.$email.val(),
                emailOptInValidation = App.dictionary.get('common.FormValidations.OptInNotCheckedEmail'),
                optInMail = this.ui.$optInMail.is(':checked'),
                optInMailValidation = App.dictionary.get('common.FormValidations.OptInForMail');

            if (this.errorMessages.length === 0) {
                    this.submit();
            } else {
                var errorView = new ErrorView(this.errorMessages);
                this.messagesRegion.show(errorView);
            }
        }
    });
    return UKBrochureOrderFormLayout;
});