define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var ContactModel = Backbone.Model.extend({
        defaults: {
            id: '',
            lastName: '',
            firstName:'',
            middleName:'',
            phone:'',
            email:''
        }
    });
    // Return the model for the module
    return ContactModel;
});