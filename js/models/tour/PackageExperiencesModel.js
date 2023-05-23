// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'models/general/MediaImageModel',
    'collections/tour/packageDateExtensions/PackageDateExtensionCollection'
], function($,_, Backbone, MediaImageModel, PackageDateExtensionCollection){
    var PackageExperiencesModel = Backbone.Model.extend({
        defaults: {
            yourRouteTitle: '',
            yourRouteSummary: '',
            yourRouteDescription: '',
            mapImage: MediaImageModel,
            extensionsHeaderTitle: '',
            extensionsHeaderSubTitle: ''
        }
    });
    // Return the model for the module
    return PackageExperiencesModel;
});