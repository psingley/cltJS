define([
    'underscore',
    'backbone',
    'models/general/createAccount/contactModel'
], function(_, Backbone, ContactModel){
    var ContactModel = Backbone.Collection.extend({
        defaults: {
            model: ContactModel
        }
    });
    // Return the model for the module
    return ContactModel;
});
