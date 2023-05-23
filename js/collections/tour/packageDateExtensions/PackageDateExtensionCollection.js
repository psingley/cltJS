// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/packageDateExtensions/PackageDateExtensionModel'
], function(_, Backbone, PackageDateExtensionModel){
    var PackageDateExtensionCollection = Backbone.Collection.extend({
        defaults: {
            model: PackageDateExtensionModel
        }
    });
    // Return the model for the module
    return PackageDateExtensionCollection;
});