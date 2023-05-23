define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/general/createAccount/contactView',
    'text!templates/general/createAccount/contactsTableTemplate.html',
    'collections/general/createAccount/contactCollection'
], function ($, _, Backbone, Marionette, App, ContactView, ContactsTableTemplate,ContactCollection) {
    var ContactsTableView = Backbone.Marionette.CompositeView.extend({
        collection: ContactCollection,
        itemView: ContactView,
        template: Backbone.Marionette.TemplateCache.get(ContactsTableTemplate),
        tagName:"div",
        id: 'tp-names-list',
        className: "table-responsive table-scroll-y",
        itemViewContainer:'tbody',
        templateHelpers: function() {
            return {
                firstName: App.dictionary.get('common.FormLabels.FirstName'),
                lastName: App.dictionary.get('common.FormLabels.LastName'),
                middleName: App.dictionary.get('common.FormLabels.MiddleName'),
                phone: App.dictionary.get('common.FormLabels.Phone'),
                email: App.dictionary.get('common.FormLabels.Email')
            }
        }
    });
    // Our module now returns our view
    return ContactsTableView;
});
