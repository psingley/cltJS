define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone, PackageDateExtensionCollection){
    var PackageDateExtensionModel = Backbone.Model.extend({
        defaults: {
            title: '',
            description: '',
            extensionTypeCode: ''
        }
    });
    // Return the model for the module
    return PackageDateExtensionModel;
});
