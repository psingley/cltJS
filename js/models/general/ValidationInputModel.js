define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var ValidationInputModel = Backbone.Model.extend({
        defaults: {
            el: "",
            dependency: "",

            // this setting is to highlight that field is always required / not required
            required: true,

            // this setting is used in case required or not should be checked dynamically
            checkRequiredAttr: false
        }
    });
    // Return the model for the module
    return ValidationInputModel;
});
