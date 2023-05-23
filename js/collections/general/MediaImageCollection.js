define([
    'underscore',
    'backbone',
    'models/general/MediaImageModel'
], function(_, Backbone, MediaImageModel){
    var MediaImageCollection = Backbone.Collection.extend({
        defaults: {
            model: MediaImageModel
        }
    });
    // Return the model for the module
    return MediaImageCollection;
});