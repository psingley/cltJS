define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'app',
    'text!templates/general/createAccount/contactTemplate.html',
    'models/general/createAccount/contactModel'
], function ($, _, Backbone, Marionette, moment, App, ContactTemplate, ContactModel) {
    var ContactView = Backbone.Marionette.ItemView.extend({
        model: ContactModel,
        tagName: "tr",
        template: Backbone.Marionette.TemplateCache.get(ContactTemplate)
    });
    // Our module now returns our view
    return ContactView;
});

