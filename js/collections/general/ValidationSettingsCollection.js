define([
    'underscore',
    'backbone',
    'models/general/ValidationSettingModel'
], function(_, Backbone, ValidationSettingModel){
    var ValidationSettingsCollection = Backbone.Collection.extend({
        defaults: {
            model: ValidationSettingModel
        }
    });
    // Return the model for the module
    return ValidationSettingsCollection;
});